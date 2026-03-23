// init-sync/populate/sync-practitioners.js

const { supabase, axios, headers, BASE_URL, CLINIC_ID, parseClinikoId } = require('./utils');

async function fetchAndUpsert(url, isActive) {
    let nextUrl = url;
    while (nextUrl) {
        const response = await axios.get(nextUrl, { headers });
        const { practitioners, links } = response.data;

        const transformed = practitioners.map(p => ({
            id: parseClinikoId(p.links.self),
            clinic_id: CLINIC_ID,
            prac_firstname: p.first_name,
            prac_lastname: p.last_name,
            prac_active: isActive,
            prac_raw_data: p
        }));

        const { error } = await supabase
            .from('prac')
            .upsert(transformed, { onConflict: 'id' });

        if (error) throw error;
        console.log(`Synced ${transformed.length} ${isActive ? 'active' : 'inactive'} practitioners...`);
        nextUrl = links.next;
    }
}

async function syncPractitioners() {
    console.log('--- Starting Practitioner Sync ---');
    try {
        await fetchAndUpsert(`${BASE_URL}/practitioners`, true);
        await fetchAndUpsert(`${BASE_URL}/practitioners/inactive`, false);
        console.log('✅ Practitioner Sync Complete');
    } catch (err) {
        console.error('❌ Error syncing practitioners:', err.message);
    }
}

syncPractitioners();