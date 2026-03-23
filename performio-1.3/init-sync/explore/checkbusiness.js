const apiKey = process.env.CLINIKO_MPPP_DASHBOARD_API;
const shard = process.env.CLINIKO_SHARD || 'au1'; // Default to au1

if (!apiKey) {
    console.error("Error: CLINIKO_MPPP_DASHBOARD_API environment variable is missing.");
    process.exit(1);
}

async function fetchInvoices() {
    // Limiting to 2 records to easily inspect the data structure
    const url = `https://api.${shard}.cliniko.com/v1/invoices?per_page=2`;

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

        console.log("Response:", JSON.stringify(data, null, 2));
        console.log(`\nFound ${data.invoices?.length || 0} invoices in this payload.`);

    } catch (error) {
        console.error("Failed to fetch invoices:", error);
    }
}

fetchInvoices();