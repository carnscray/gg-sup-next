const { supabase, axios, headers, BASE_URL, CLINIC_ID, parseClinikoId } = require('./utils');

async function syncLocations() {
    console.log('--- Starting Location (Businesses) Sync (Including Archived/Deleted) ---');

    // We run three separate passes to ensure we get absolutely everything
    const endpoints = [
        `${BASE_URL}/businesses`, // 1. Active locations
        `${BASE_URL}/businesses?q[]=archived_at:>=1990-01-01T00:00:00Z`, // 2. Modern archived locations
        `${BASE_URL}/businesses?q[]=deleted_at:>=1990-01-01T00:00:00Z`   // 3. Legacy deleted locations
    ];

    let totalSynced = 0;

    try {
        for (let initialUrl of endpoints) {
            let nextUrl = initialUrl;

            while (nextUrl) {
                const response = await axios.get(nextUrl, { headers });
                const { businesses, links } = response.data;

                if (!businesses || businesses.length === 0) break;

                const transformed = businesses.map(b => ({
                    id: parseClinikoId(b.links.self),
                    clinic_id: CLINIC_ID,
                    loc_name: b.business_name,
                    loc_state: b.state,
                    loc_city: b.city,
                    // A location is active if it lacks both an archived and deleted timestamp
                    loc_is_active: !b.archived_at && !b.deleted_at,
                    deleted_at: b.deleted_at || null,
                    archived_at: b.archived_at || null,
                    loc_raw_data: b
                }));

                const { error } = await supabase
                    .from('location')
                    .upsert(transformed, { onConflict: 'id' });

                if (error) {
                    console.error('Supabase Error:', error.message);
                    throw error;
                }

                totalSynced += transformed.length;
                console.log(`Synced ${totalSynced} total locations so far...`);

                nextUrl = links?.next || null;
            }
        }
        console.log('✅ Master Location Sync Complete');
    } catch (err) {
        console.error('❌ Error syncing locations:', err.message);
    }
}

syncLocations();