import { createClient } from "@/lib/supabase/server";

export interface MatrixMetrics {
    total_revenue: number;
    total_appointments: number;
    avg_revenue: number;
    dna_count: number;
    cancelled_count: number;
}

export interface QuarterSummary extends MatrixMetrics {
    label: string;
}

export interface WeekSummary extends MatrixMetrics {
    weekIndex: number;
    label: string;
    startDate: string;
}

export interface MatrixData {
    historicalQuarters: QuarterSummary[];
    weeklyData: WeekSummary[];
}

export async function fetchMatrixKPIs(
    pracId?: string,
    locationId?: string,
    selectedWeekIndex: number = 1
) {
    const supabase = await createClient();

    try {
        // Start of the world for our matrix is Jan 1, 2025
        const startDate = '2025-01-01';

        // Calculate the end date based on selectedWeekIndex
        // Week 1 starts Mon Jan 5, 2026.
        const week1Start = new Date('2026-01-05T00:00:00+11:00');
        const selectedWeekStart = new Date(week1Start.getTime() + (selectedWeekIndex - 1) * 7 * 24 * 60 * 60 * 1000);
        const selectedWeekEnd = new Date(selectedWeekStart.getTime() + (7 * 24 * 60 * 60 * 1000) - 1000);

        const toDateStr = selectedWeekEnd.toISOString().split('T')[0];

        // 1. Fetch Bookings
        let bookingsQuery = supabase
            .from('booking')
            .select('id, prac_id, location_id, patient_arrived, booking_did_not_arrive, booking_cancelled_at, booking_starts_at')
            .gte('booking_starts_at', `${startDate}T00:00:00+11:00`)
            .lte('booking_starts_at', selectedWeekEnd.toISOString());

        if (pracId) bookingsQuery = bookingsQuery.eq('prac_id', pracId);
        if (locationId) bookingsQuery = bookingsQuery.eq('location_id', locationId);

        const { data: bookings, error: bError } = await bookingsQuery;
        if (bError) throw new Error(`Booking fetch error: ${bError.message}`);

        // 2. Fetch Invoices
        let invoicesQuery = supabase
            .from('inv')
            .select('id, prac_id, location_id, inv_net_amount, inv_issue_date, inv_status_description, deleted_at')
            .is('deleted_at', null)
            .neq('inv_status_description', 'Voided')
            .gte('inv_issue_date', startDate)
            .lte('inv_issue_date', toDateStr);

        if (pracId) invoicesQuery = invoicesQuery.eq('prac_id', pracId);
        if (locationId) invoicesQuery = invoicesQuery.eq('location_id', locationId);

        const { data: invoices, error: iError } = await invoicesQuery;
        if (iError) throw new Error(`Invoice fetch error: ${iError.message}`);

        // 3. Helper to initialize metrics
        const createEmptyMetrics = (): MatrixMetrics => ({
            total_revenue: 0,
            total_appointments: 0,
            avg_revenue: 0,
            dna_count: 0,
            cancelled_count: 0
        });

        // 4. Define Periods
        const historicalQuarters: QuarterSummary[] = [
            { label: '2025 Q1', ...createEmptyMetrics() },
            { label: '2025 Q2', ...createEmptyMetrics() },
            { label: '2025 Q3', ...createEmptyMetrics() },
            { label: '2025 Q4', ...createEmptyMetrics() },
            { label: '2026 Q1', ...createEmptyMetrics() },
        ];

        // Weekly data for 2026 up to selectedWeekIndex
        const weeklyData: WeekSummary[] = [];
        for (let i = 1; i <= selectedWeekIndex; i++) {
            const wStart = new Date(week1Start.getTime() + (i - 1) * 7 * 24 * 60 * 60 * 1000);
            const wEnd = new Date(wStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1000);
            weeklyData.push({
                weekIndex: i,
                label: `Week ${i}`,
                startDate: wStart.toISOString(),
                ...createEmptyMetrics()
            });
        }

        // 5. Aggregate Data
        const getQuarterIndex = (date: Date): number => {
            const year = date.getFullYear();
            const month = date.getMonth(); // 0-indexed
            if (year === 2025) {
                return Math.floor(month / 3);
            } else if (year === 2026 && month < 3) {
                return 4; // 2026 Q1
            }
            return -1;
        };

        const getWeekIndex2026 = (date: Date): number => {
            if (date.getFullYear() !== 2026) return -1;
            const diff = date.getTime() - week1Start.getTime();
            if (diff < 0) return -1;
            return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
        };

        bookings?.forEach(b => {
            const date = new Date(b.booking_starts_at);
            const qIdx = getQuarterIndex(date);
            const wIdx = getWeekIndex2026(date);

            const isCancelled = !!b.booking_cancelled_at;
            const isDNA = b.booking_did_not_arrive === true;
            const isArrived = b.patient_arrived === true && !isDNA && !isCancelled;

            if (qIdx !== -1) {
                if (isCancelled) historicalQuarters[qIdx].cancelled_count += 1;
                if (isDNA) historicalQuarters[qIdx].dna_count += 1;
                if (isArrived) historicalQuarters[qIdx].total_appointments += 1;
            }

            if (wIdx !== -1 && wIdx <= selectedWeekIndex) {
                if (isCancelled) weeklyData[wIdx - 1].cancelled_count += 1;
                if (isDNA) weeklyData[wIdx - 1].dna_count += 1;
                if (isArrived) weeklyData[wIdx - 1].total_appointments += 1;
            }
        });

        invoices?.forEach(inv => {
            const date = new Date(inv.inv_issue_date);
            const qIdx = getQuarterIndex(date);
            const wIdx = getWeekIndex2026(date);

            const revenue = Number(inv.inv_net_amount || 0);

            if (qIdx !== -1) {
                historicalQuarters[qIdx].total_revenue += revenue;
            }

            if (wIdx !== -1 && wIdx <= selectedWeekIndex) {
                weeklyData[wIdx - 1].total_revenue += revenue;
            }
        });

        // 6. Calculate Averages
        historicalQuarters.forEach(q => {
            q.avg_revenue = q.total_appointments > 0 ? q.total_revenue / q.total_appointments : 0;
        });

        weeklyData.forEach(w => {
            w.avg_revenue = w.total_appointments > 0 ? w.total_revenue / w.total_appointments : 0;
        });

        return {
            success: true,
            data: { historicalQuarters, weeklyData },
            error: null
        };

    } catch (err: any) {
        console.error("Failed to fetch matrix KPIs:", err);
        return { success: false, data: null, error: err.message };
    }
}

export async function fetchFilterOptions() {
    const supabase = await createClient();
    try {
        const { data: practitioners } = await supabase
            .from('prac')
            .select('id, prac_firstname, prac_lastname')
            .eq('prac_active', true)
            .order('prac_firstname');

        const { data: locations } = await supabase
            .from('location')
            .select('id, loc_name')
            .eq('loc_is_active', true)
            .order('loc_name');

        return {
            practitioners: practitioners?.map(p => ({
                id: p.id,
                name: `${p.prac_firstname || ''} ${p.prac_lastname || ''}`.trim()
            })) || [],
            locations: locations?.map(l => ({
                id: l.id,
                name: l.loc_name
            })) || []
        };
    } catch (err) {
        console.error("Failed to fetch filter options:", err);
        return { practitioners: [], locations: [] };
    }
}
