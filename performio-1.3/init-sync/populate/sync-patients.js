// cliniko-sync/populate/sync-patients.js

const { supabase, axios, headers, BASE_URL, CLINIC_ID, parseClinikoId } = require('./utils');

async function syncPatients() {
    console.log('--- Starting Patient Sync (Privacy Mode: First Name Only) ---');
    let nextUrl = `${BASE_URL}/patients`;
    let totalSynced = 0;

    try {
        while (nextUrl) {
            const response = await axios.get(nextUrl, { headers });
            const { patients, links } = response.data;

            if (!patients || patients.length === 0) break;

            const transformed = patients.map(p => ({
                id: parseClinikoId(p.links.self),
                clinic_id: CLINIC_ID,
                patient_firstname: p.first_name,
                // We explicitly null these to prevent accidental data leaks
                patient_lastname: null,
                // We strip the raw data blob to only include non-sensitive fields
                patient_raw_data: {
                    id: parseClinikoId(p.links.self),
                    first_name: p.first_name,
                    created_at: p.created_at,
                    updated_at: p.updated_at
                }
            }));

            const { error } = await supabase
                .from('patient')
                .upsert(transformed, { onConflict: 'id' });

            if (error) {
                console.error('Supabase Error:', error.message);
                throw error;
            }

            totalSynced += transformed.length;
            console.log(`Synced ${totalSynced} patients...`);

            nextUrl = links.next;
        }
        console.log('✅ Patient Sync Complete');
    } catch (err) {
        console.error('❌ Error syncing patients:', err.message);
    }
}

syncPatients();