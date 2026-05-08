import DashboardFilterBar from "./components/dashboard-filter-bar";
import { WeeklyRevenueChart } from "./components/weekly-revenue-chart";
import { fetchWeeklyRevenue } from "./actions/fetch-weekly-revenue";

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // 1. Await the searchParams promise (Next.js 15 requirement)
    const resolvedSearchParams = await searchParams;

    // 2. Grab dates from the URL
    const from = typeof resolvedSearchParams.from === 'string' ? resolvedSearchParams.from : undefined;
    const to = typeof resolvedSearchParams.to === 'string' ? resolvedSearchParams.to : undefined;

    let chartData: { week: string; revenue: number }[] = [];
    let fetchError: string | null = null;

    // 3. Only run the database query if we have both dates
    if (from && to) {
        const { success, data, error } = await fetchWeeklyRevenue(from, to);
        if (success && data) {
            chartData = data;
        } else if (error) {
            fetchError = error;
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <p className="text-muted-foreground">High-level clinic performance and trends.</p>
            </div>

            {/* The Date Filter Bar */}
            <DashboardFilterBar />

            {/* Error Handling */}
            {fetchError && (
                <div className="text-destructive mb-4 font-medium p-4 border border-destructive rounded-lg bg-destructive/10">
                    Error loading dashboard data: {fetchError}
                </div>
            )}

            {/* Prompt user for dates if empty, otherwise show the chart */}
            {!from || !to ? (
                <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground mt-6">
                    Please select a start and end date to view your metrics.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    {/* The chart is wrapped in a grid so you can easily add 
                      Summary Stat Cards (Total Revenue, Total Appts, etc) 
                      next to or above it later! 
                    */}
                    <WeeklyRevenueChart data={chartData} />
                </div>
            )}
        </div>
    );
}