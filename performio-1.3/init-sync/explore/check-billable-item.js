const apiKey = process.env.CLINIKO_MPPP_DASHBOARD_API;
const shard = process.env.CLINIKO_SHARD || 'au1'; // Default to au1

if (!apiKey) {
    console.error("Error: CLINIKO_MPPP_DASHBOARD_API environment variable is missing.");
    process.exit(1);
}

async function fetchBillableItems() {
    // Fetch the 5 most recent billable items to easily inspect the data structure
    const url = `https://api.${shard}.cliniko.com/v1/billable_items?sort=created_at:desc&per_page=5`;

    // Cliniko uses Basic Auth: base64(API_KEY + ":")
    const authHeader = `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`;

    try {
        console.log(`Fetching billable items from ${url}...`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json',
                'User-Agent': 'Performio (admin@performio.com)'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
        }

        const data = await response.json();

        console.log("=== RAW BILLABLE ITEM DATA ===");
        // Only printing the billable_items array to make it easier to read
        console.log(JSON.stringify(data.billable_items, null, 2));
        console.log(`\nFound ${data.billable_items?.length || 0} billable items in this payload.`);

    } catch (error) {
        console.error("Failed to fetch billable items:", error);
    }
}

fetchBillableItems();