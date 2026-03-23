// cliniko-sync/populate/sync-apptypes.js
const { supabase, axios, headers, BASE_URL, CLINIC_ID, parseClinikoId } = require('./utils');

async function syncAppTypes() {
    console.log('--- Starting Appointment Type Sync ---');
    let nextUrl = `${BASE_URL}/appointment_types`;

    try {
        while (nextUrl) {
            const response = await axios.get(nextUrl, { headers });
            const { appointment_types, links } = response.data;

            const transformed = appointment_types.map(at => ({
                id: parseClinikoId(at.links.self),
                clinic_id: CLINIC_ID,
                apptype_name: at.name,
                apptype_max_attendees: at.max_attendees,
                apptype_raw_data: at
            }));

            const { error } = await supabase
                .from('apptype')
                .upsert(transformed, { onConflict: 'id' });

            if (error) throw error;
            console.log(`Synced ${transformed.length} appointment types...`);
            nextUrl = links.next;
        }
        console.log('✅ Appointment Type Sync Complete');
    } catch (err) {
        console.error('❌ Error syncing appointment types:', err.message);
    }
}

syncAppTypes();