const { supabase, axios, headers, BASE_URL, CLINIC_ID, parseClinikoId } = require('./utils');

async function syncEndpoint(urlPath, typeLabel) {
    console.log(`--- Syncing ${typeLabel} ---`);
    const startDate = '2026-01-01T00:00:00Z';
    const endDate = '2026-03-20T23:59:59Z';

    let nextUrl = `${BASE_URL}/${urlPath}?q[]=starts_at:>=${startDate}&q[]=starts_at:<=${endDate}`;
    let totalSynced = 0;

    try {
        while (nextUrl) {
            const response = await axios.get(nextUrl, { headers });
            const dataKey = Object.keys(response.data).find(key => Array.isArray(response.data[key]));
            const records = response.data[dataKey];
            const links = response.data.links;

            if (!records || records.length === 0) break;

            const transformed = records.map(b => ({
                id: parseClinikoId(b.links.self),
                clinic_id: CLINIC_ID,
                location_id: b.business ? parseClinikoId(b.business.links.self) : null,
                prac_id: b.practitioner ? parseClinikoId(b.practitioner.links.self) : null,
                patient_id: b.patient ? parseClinikoId(b.patient.links.self) : null,
                apptype_id: b.appointment_type ? parseClinikoId(b.appointment_type.links.self) : null,

                // Core Dates
                booking_starts_at: b.starts_at,
                booking_ends_at: b.ends_at,
                created_at: b.created_at || null,
                updated_at: b.updated_at,
                deleted_at: b.deleted_at || null,
                archived_at: b.archived_at || null,

                // Status & Attendance
                booking_type: typeLabel.toLowerCase().split(' ')[0],
                patient_arrived: b.patient_arrived || false,
                booking_did_not_arrive: b.did_not_arrive || false,

                // Financial & Compliance
                invoice_status: b.invoice_status || null,
                treatment_note_status: b.treatment_note_status || null,
                case_id: b.patient_case ? parseClinikoId(b.patient_case.links.self) : null,

                // Cancellations
                booking_cancelled_at: b.cancelled_at || null,
                cancellation_reason_id: b.cancellation_reason ? String(b.cancellation_reason) : null,
                cancellation_reason: b.cancellation_reason ? String(b.cancellation_reason) : null,
                cancellation_reason_desc: b.cancellation_reason_description || null,
                cancellation_note: b.cancellation_note || null,

                // --- NEWLY ADDED COLUMNS ---
                booking_ip_address: b.booking_ip_address || null,
                email_reminder_sent: b.email_reminder_sent || false,
                sms_reminder_sent: b.sms_reminder_sent || false,
                has_patient_appointment_notes: b.has_patient_appointment_notes || false,
                notes: b.notes || null,
                online_booking_policy_accepted: b.online_booking_policy_accepted || null,
                patient_name: b.patient_name || null,
                repeat_rule: b.repeat_rule || null,

                // THE FIX: If b.repeats is an object, make it 'true', otherwise 'false'
                repeats: b.repeats ? true : false,

                telehealth_url: b.telehealth_url || null,
                // ---------------------------

                // JSON Data
                booking_unavailable_block_type: b.unavailable_block_type || null,
                booking_raw_data: b
            }));

            const { error } = await supabase
                .from('booking')
                .upsert(transformed, { onConflict: 'id' });

            if (error) throw error;

            totalSynced += transformed.length;
            console.log(`Synced ${totalSynced} ${typeLabel}...`);
            nextUrl = links?.next || null;
        }
    } catch (err) {
        console.error(`❌ Error syncing ${typeLabel}:`, err.message);
    }
}

async function runMasterBookingSync() {
    await syncEndpoint('individual_appointments', 'Individual Appointments');
    await syncEndpoint('group_appointments', 'Group Appointments');
    await syncEndpoint('unavailable_blocks', 'Unavailable Blocks');
    await syncEndpoint('individual_appointments/cancelled', 'Cancelled Appointments');
    console.log('✅ Master Booking Sync Complete');
}

runMasterBookingSync();