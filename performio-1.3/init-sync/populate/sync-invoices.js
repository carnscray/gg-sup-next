// cliniko-sync/populate/sync-invoices.js

const { supabase, axios, headers, BASE_URL, CLINIC_ID, parseClinikoId } = require('./utils');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// NEW: Robust fetcher that will retry up to 3 times before giving up
async function fetchWithRetry(url, config, retries = 3, backoffMs = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            // Added a 15-second timeout so it doesn't hang indefinitely
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

async function syncInvoices() {
    console.log('--- Starting Invoice & Invoice Item Sync (With Auto-Retry) ---');

    const startDate = '2026-01-01';
    const endDate = '2026-03-20';

    let nextUrl = `${BASE_URL}/invoices?q[]=issue_date:>=${startDate}&q[]=issue_date:<=${endDate}`;
    let totalInvoicesSynced = 0;
    let totalItemsSynced = 0;

    try {
        while (nextUrl) {
            // UPDATED: Use the retry function
            const response = await fetchWithRetry(nextUrl, { headers });
            const { invoices, links } = response.data;

            if (!invoices || invoices.length === 0) break;

            const transformedInvoices = invoices.map(i => ({
                id: parseClinikoId(i.links.self),
                clinic_id: CLINIC_ID,
                location_id: i.business ? parseClinikoId(i.business.links.self) : null, // <--- ADDED LOCATION ID HERE
                prac_id: i.practitioner ? parseClinikoId(i.practitioner.links.self) : null,
                patient_id: i.patient ? parseClinikoId(i.patient.links.self) : null,
                booking_id: i.appointment ? parseClinikoId(i.appointment.links.self) : null,

                inv_issue_date: i.issue_date,
                inv_status: i.status || null,
                inv_status_description: i.status_description || null,
                inv_net_amount: i.net_amount || 0,
                inv_total_amount: i.total_amount || 0,

                created_at: i.created_at,
                updated_at: i.updated_at,
                deleted_at: i.deleted_at || null,

                inv_raw_data: {
                    id: i.id,
                    number: i.number,
                    tax_amount: i.tax_amount,
                    calculation_method: i.calculation_method
                }
            }));

            const { error: invError } = await supabase
                .from('inv')
                .upsert(transformedInvoices, { onConflict: 'id' });

            if (invError) throw invError;
            totalInvoicesSynced += transformedInvoices.length;
            console.log(`Synced ${totalInvoicesSynced} invoices... fetching items...`);

            for (const invoice of invoices) {
                if (invoice.invoice_items && invoice.invoice_items.links.self) {
                    await sleep(200); // Respect rate limits

                    // UPDATED: Use the retry function for items too
                    const itemsResponse = await fetchWithRetry(invoice.invoice_items.links.self, { headers });
                    const items = itemsResponse.data.invoice_items;

                    if (items && items.length > 0) {
                        const transformedItems = items.map(item => ({
                            id: parseClinikoId(item.links.self),
                            clinic_id: CLINIC_ID,
                            inv_id: parseClinikoId(item.invoice.links.self),

                            item_name: item.name,
                            item_code: item.code || null,
                            item_quantity: item.quantity || 1,
                            item_unit_price: item.unit_price || 0,
                            item_net_price: item.net_price || 0,
                            item_tax_amount: item.tax_amount || 0,

                            item_is_product: item.product ? true : false,

                            created_at: item.created_at,
                            updated_at: item.updated_at,
                            deleted_at: item.deleted_at || null,
                            item_raw_data: item
                        }));

                        const { error: itemError } = await supabase
                            .from('inv_item')
                            .upsert(transformedItems, { onConflict: 'id' });

                        if (itemError) throw itemError;
                        totalItemsSynced += transformedItems.length;
                    }
                }
            }

            console.log(`... Synced ${totalItemsSynced} invoice items so far.`);
            nextUrl = links?.next || null;
        }
        console.log('✅ Master Invoice & Item Sync Complete');
    } catch (err) {
        console.error('❌ Error syncing invoices/items:', err.message);
    }
}

syncInvoices();