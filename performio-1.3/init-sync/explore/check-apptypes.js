const apiKey = process.env.CLINIKO_MPPP_DASHBOARD_API;
const shard = process.env.CLINIKO_SHARD || 'au1'; // Default to au1

if (!apiKey) {
    console.error("Error: CLINIKO_MPPP_DASHBOARD_API environment variable is missing.");
    process.exit(1);
}

async function fetchAppointmentTypes() {
    // Fetch 5 appointment types to easily inspect the data structure
    const url = `https://api.${shard}.cliniko.com/v1/appointment_types?per_page=5`;

    // Cliniko uses Basic Auth: base64(API_KEY + ":")
    const authHeader = `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`;

    try {
        console.log(`Fetching appointment types from ${url}...`);

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

        console.log("=== RAW APPOINTMENT TYPE DATA ===");
        // Only printing the appointment_types array to make it easier to read
        console.log(JSON.stringify(data.appointment_types, null, 2));
        console.log(`\nFound ${data.appointment_types?.length || 0} appointment types in this payload.`);

    } catch (error) {
        console.error("Failed to fetch appointment types:", error);
    }
}

fetchAppointmentTypes();