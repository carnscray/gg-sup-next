// init-sync/populate/sync-billable-items.js

const { supabase, axios, headers, BASE_URL, CLINIC_ID, parseClinikoId } = require('./utils');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Robust fetcher that will retry up to 3 times before giving up
async function fetchWithRetry(url, config, retries = 3, backoffMs = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await axios.get(url, { ...config, timeout: 15000 });
        } catch (error) {
            const isLastAttempt = i === retries - 1;
            if (isLastAttempt) throw error;

            console.warn(`⚠️ Network hiccup (${error.code || error.message}). Retrying in ${backoffMs / 1000}s... (Attempt ${i + 1}/${retries})`);
            await sleep(backoffMs);
            backoffMs *= 2; // Exponential backoff: 2s, 4s, 8s
        }
    }
}

async function syncBillableItems() {
    console.log('--- Starting Billable Items Sync (With Auto-Retry) ---');

    // We fetch ALL items (no date filters needed) because this is a master product/service list
    let nextUrl = `${BASE_URL}/billable_items`;
    let totalItemsSynced = 0;

    try {
        while (nextUrl) {
            const response = await fetchWithRetry(nextUrl, { headers });
            const { billable_items, links } = response.data;

            if (!billable_items || billable_items.length === 0) break;

            const transformedItems = billable_items.map(item => ({
                id: parseClinikoId(item.links.self),
                clinic_id: CLINIC_ID,
                name: item.name || null,
                item_code: item.item_code || null,

                // 🚨 THE GOLDEN TICKET FOR THE MATRIX: 'Service' vs 'Product'
                item_type: item.item_type || null,

                price: item.price ? parseFloat(item.price) : 0,

                created_at: item.created_at || null,
                updated_at: item.updated_at || null,
                archived_at: item.archived_at || null,

                billable_item_raw_data: item
            }));

            const { error } = await supabase
                .from('billable_item')
                .upsert(transformedItems, { onConflict: 'id' });

            if (error) throw error;

            totalItemsSynced += transformedItems.length;
            console.log(`Synced ${totalItemsSynced} billable items so far...`);

            // Handle pagination
            nextUrl = links?.next || null;

            // Respect API limits
            await sleep(200);
        }
        console.log('✅ Master Billable Items Sync Complete');
    } catch (err) {
        console.error('❌ Error syncing billable items:', err.message);
    }
}

syncBillableItems();