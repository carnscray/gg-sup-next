const apiKey = process.env.CLINIKO_MPPP_DASHBOARD_API;
const shard = process.env.CLINIKO_SHARD || 'au1'; // Default to au1

if (!apiKey) {
    console.error("Error: CLINIKO_MPPP_DASHBOARD_API environment variable is missing.");
    process.exit(1);
}

async function fetchInvoices() {
    // Fetch the 5 most recent invoices to ensure we see current data and closed invoices
    const url = `https://api.${shard}.cliniko.com/v1/invoices?sort=created_at:desc&per_page=5`;

    // Cliniko uses Basic Auth: base64(API_KEY + ":")
    const authHeader = `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`;

    try {
        console.log(`Fetching invoices from ${url}...`);

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

        console.log("=== RAW INVOICE DATA ===");
        // Only printing the invoices array to make it easier to read the actual fields
        console.log(JSON.stringify(data.invoices, null, 2));
        console.log(`\nFound ${data.invoices?.length || 0} invoices in this payload.`);

    } catch (error) {
        console.error("Failed to fetch invoices:", error);
    }
}

fetchInvoices();