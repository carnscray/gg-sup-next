// init-sync/populate/sync-invoices.js

const { supabase, axios, headers, BASE_URL, CLINIC_ID, parseClinikoId } = require('./utils');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Robust fetcher that will retry up to 3 times before giving up
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
            const response = await fetchWithRetry(nextUrl, { headers });
            const { invoices, links } = response.data;

            if (!invoices || invoices.length === 0) break;

            const transformedInvoices = invoices.map(i => ({
                id: parseClinikoId(i.links.self),
                clinic_id: CLINIC_ID,
                location_id: i.business ? parseClinikoId(i.business.links.self) : null,
                prac_id: i.practitioner ? parseClinikoId(i.practitioner.links.self) : null,
                patient_id: i.patient ? parseClinikoId(i.patient.links.self) : null,
                booking_id: i.appointment ? parseClinikoId(i.appointment.links.self) : null,

                inv_issue_date: i.issue_date,
                inv_status: i.status || null,
                inv_status_description: i.status_description || null,
                inv_net_amount: i.net_amount ? parseFloat(i.net_amount) : 0,
                inv_total_amount: i.total_amount ? parseFloat(i.total_amount) : 0,

                inv_number: i.number ? i.number.toString() : null,
                inv_closed_at: i.closed_at || null,
                inv_archived_at: i.archived_at || null,
                inv_tax_amount: i.tax_amount ? parseFloat(i.tax_amount) : 0,
                inv_discounted_amount: i.discounted_amount ? parseFloat(i.discounted_amount) : 0,
                inv_calculation_method: i.calculation_method || null,
                inv_calculation_method_description: i.calculation_method_description || null,
                inv_invoice_to: i.invoice_to || null,
                inv_notes: i.notes || null,
                inv_patient_extra_information: i.patient_extra_information || null,
                inv_online_payment_url: i.online_payment_url || null,

                created_at: i.created_at,
                updated_at: i.updated_at,
                deleted_at: i.deleted_at || null,

                inv_raw_data: i
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

                    const itemsResponse = await fetchWithRetry(invoice.invoice_items.links.self, { headers });
                    const items = itemsResponse.data.invoice_items;

                    if (items && items.length > 0) {
                        const transformedItems = items.map(item => ({
                            id: parseClinikoId(item.links.self),
                            clinic_id: CLINIC_ID,
                            inv_id: parseClinikoId(item.invoice.links.self),

                            item_name: item.name,
                            item_code: item.code || null,
                            item_quantity: item.quantity ? parseFloat(item.quantity) : 1,
                            item_unit_price: item.unit_price ? parseFloat(item.unit_price) : 0,
                            item_net_price: item.net_price ? parseFloat(item.net_price) : 0,
                            item_tax_amount: item.tax_amount ? parseFloat(item.tax_amount) : 0,

                            // We leave this fallback in place just in case, but rely on billable_items for products
                            item_is_product: item.product ? true : false,

                            // --- ALL NEWLY ADDED COLUMNS ---
                            item_concession_type_name: item.concession_type_name || null,
                            item_discount_percentage: item.discount_percentage ? parseFloat(item.discount_percentage) : null,
                            item_discounted_amount: item.discounted_amount ? parseFloat(item.discounted_amount) : 0,
                            item_is_monetary_discount: item.is_monetary_discount || false,
                            item_tax_name: item.tax_name || null,
                            item_tax_rate: item.tax_rate ? parseFloat(item.tax_rate) : null,
                            item_total_including_tax: item.total_including_tax ? parseFloat(item.total_including_tax) : 0,

                            // Extract the billable_item ID to link back to product flags later!
                            billable_item_id: item.billable_item ? parseClinikoId(item.billable_item.links.self) : null,

                            archived_at: item.archived_at || null,
                            // -------------------------------

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