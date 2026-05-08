import MatrixFilterBar from "./components/matrix-filter-bar";
import MatrixView from "./components/matrix-view";
import { fetchMatrixKPIs, fetchFilterOptions } from "./actions/fetch-matrix-kpis";

export default async function MatrixPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // 1. Await the searchParams promise
    const resolvedSearchParams = await searchParams;

    // 2. Extract filters from URL
    const week = typeof resolvedSearchParams.week === 'string' ? parseInt(resolvedSearchParams.week) : 18; // Default to week 18 (May 2026)
    const prac = typeof resolvedSearchParams.prac === 'string' ? resolvedSearchParams.prac : undefined;
    const loc = typeof resolvedSearchParams.loc === 'string' ? resolvedSearchParams.loc : undefined;

    // 3. Fetch data and options
    const [{ success, data, error }, options] = await Promise.all([
        fetchMatrixKPIs(prac === 'all' ? undefined : prac, loc === 'all' ? undefined : loc, week),
        fetchFilterOptions()
    ]);

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold">Practitioner Matrix</h2>
                <p className="text-muted-foreground">Performance metrics by practitioner.</p>
            </div>

            <MatrixFilterBar options={options} />

            {error && (
                <div className="text-destructive mb-4 font-medium p-4 border border-destructive rounded-lg bg-destructive/10">
                    Error loading metrics: {error}
                </div>
            )}

            {/* 4. Render the new Matrix View */}
            {success && data && <MatrixView data={data} />}
        </div>
    );
}
