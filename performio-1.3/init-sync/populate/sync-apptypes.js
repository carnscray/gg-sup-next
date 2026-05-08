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

                // --- NEW COLUMNS ---
                apptype_category: at.category || null,
                apptype_description: at.description || null,
                apptype_color: at.color || null,
                apptype_duration_in_minutes: at.duration_in_minutes || null,
                apptype_show_in_online_bookings: at.show_in_online_bookings || false,
                apptype_online_bookings_lead_time_hours: at.online_bookings_lead_time_hours || null,
                apptype_online_payments_enabled: at.online_payments_enabled || false,
                apptype_online_payments_mode: at.online_payments_mode || null,
                // Parse string "50.0" to a numeric value for Postgres
                apptype_deposit_price: at.deposit_price ? parseFloat(at.deposit_price) : null,
                apptype_add_deposit_to_account_credit: at.add_deposit_to_account_credit || false,
                apptype_telehealth_enabled: at.telehealth_enabled || false,

                created_at: at.created_at || null,
                updated_at: at.updated_at || null,
                archived_at: at.archived_at || null,
                // -------------------

                apptype_raw_data: at
            }));

            const { error } = await supabase
                .from('apptype')
                .upsert(transformed, { onConflict: 'id' });

            if (error) throw error;
            console.log(`Synced ${transformed.length} appointment types...`);

            // Handle Cliniko pagination
            nextUrl = links && links.next ? links.next : null;
        }
        console.log('✅ Appointment Type Sync Complete');
    } catch (err) {
        console.error('❌ Error syncing appointment types:', err.message);
    }
}

syncAppTypes();