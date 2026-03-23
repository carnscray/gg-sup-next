import MatrixFilterBar from "./components/matrix-filter-bar";
import MatrixTable from "./components/matrix-table";
import { fetchMatrixKPIs } from "./actions/fetch-matrix-kpis";

export default async function MatrixPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // 1. Await the searchParams promise (Next.js 15 requirement)
    const resolvedSearchParams = await searchParams;

    // 2. Grab dates from the URL
    const from = typeof resolvedSearchParams.from === 'string' ? resolvedSearchParams.from : undefined;
    const to = typeof resolvedSearchParams.to === 'string' ? resolvedSearchParams.to : undefined;

    // 3. Fetch the data based on dates
    const { success, data, error } = await fetchMatrixKPIs(from, to);

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold">Practitioner Matrix</h2>
                <p className="text-muted-foreground">Performance metrics by practitioner.</p>
            </div>

            <MatrixFilterBar />

            {error && (
                <div className="text-destructive mb-4 font-medium p-4 border border-destructive rounded-lg bg-destructive/10">
                    Error loading metrics: {error}
                </div>
            )}

            {/* 4. Render the table */}
            {success && <MatrixTable data={data || []} />}
        </div>
    );
}