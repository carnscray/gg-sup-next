'use server';

import { createClient } from "@/lib/supabase/server";

export interface PractitionerKPIs {
    prac_id: string;
    prac_name: string;
    total_revenue: number;
    total_appointments: number;
    avg_revenue: number;
    dna_count: number;
    cancelled_count: number;
}

export async function fetchMatrixKPIs(fromDate?: string, toDate?: string) {
    const supabase = await createClient();

    try {
        if (!fromDate || !toDate) {
            return { success: true, data: [] as PractitionerKPIs[], error: null };
        }

        // 1. Calculate precise Melbourne bounds 
        // Melbourne is UTC +11 during AEDT. We append +11:00 so Postgres knows exactly 
        // when our local midnight occurs compared to the UTC timestamps in the database.
        const melbourneOffset = '+11:00';
        const startDateTime = `${fromDate}T00:00:00${melbourneOffset}`;
        const endDateTime = `${toDate}T23:59:59${melbourneOffset}`;

        // 2. Fetch Bookings (Using the timezone-aware dates!)
        const { data: bookings, error: bError } = await supabase
            .from('booking')
            .select('id, prac_id, patient_arrived, booking_did_not_arrive, booking_cancelled_at, booking_starts_at')
            .gte('booking_starts_at', startDateTime)
            .lte('booking_starts_at', endDateTime);

        if (bError) throw new Error(`Booking fetch error: ${bError.message}`);

        // 3. Fetch Invoices (Include over-the-counter, exclude voided & deleted)
        const { data: invoices, error: iError } = await supabase
            .from('inv')
            .select('id, prac_id, inv_net_amount, inv_issue_date, inv_status_description, deleted_at')
            .is('deleted_at', null) // Exclude hard-deleted invoices
            .neq('inv_status_description', 'Voided') // Exclude voided invoices
            .gte('inv_issue_date', fromDate)
            .lte('inv_issue_date', toDate);

        if (iError) throw new Error(`Invoice fetch error: ${iError.message}`);

        // 4. Fetch ONLY Active Practitioners (THIS IS THE PIECE THAT WENT MISSING!)
        const { data: practitioners, error: pError } = await supabase
            .from('prac')
            .select('id, prac_firstname, prac_lastname')
            .eq('prac_active', true);

        if (pError) throw new Error(`Practitioner fetch error: ${pError.message}`);

        // 5. Initialize Data Map with all Active Practitioners
        const metricsMap: Record<string, PractitionerKPIs> = {};

        practitioners?.forEach(p => {
            metricsMap[p.id] = {
                prac_id: p.id,
                prac_name: `${p.prac_firstname || ''} ${p.prac_lastname || ''}`.trim(),
                total_revenue: 0,
                total_appointments: 0,
                avg_revenue: 0,
                dna_count: 0,
                cancelled_count: 0
            };
        });

        // 6. Aggregate Data (Skipping any records that belong to inactive/missing practitioners)
        bookings?.forEach(b => {
            if (!b.prac_id || !metricsMap[b.prac_id]) return;

            const isCancelled = !!b.booking_cancelled_at;
            const isDNA = b.booking_did_not_arrive === true;
            const isArrived = b.patient_arrived === true && !isDNA && !isCancelled;

            if (isCancelled) metricsMap[b.prac_id].cancelled_count += 1;
            if (isDNA) metricsMap[b.prac_id].dna_count += 1;
            if (isArrived) metricsMap[b.prac_id].total_appointments += 1;
        });

        invoices?.forEach(inv => {
            if (!inv.prac_id || !metricsMap[inv.prac_id]) return;

            metricsMap[inv.prac_id].total_revenue += Number(inv.inv_net_amount || 0);
        });

        // 7. Calculate Averages & Sort Alphabetically
        const finalData = Object.values(metricsMap).map(prac => {
            prac.avg_revenue = prac.total_appointments > 0
                ? prac.total_revenue / prac.total_appointments
                : 0;
            return prac;
        });

        // Sort by Practitioner Name (Alphabetical)
        finalData.sort((a, b) => a.prac_name.localeCompare(b.prac_name));

        return { success: true, data: finalData, error: null };

    } catch (err: any) {
        console.error("Failed to fetch matrix KPIs:", err);
        return { success: false, data: null, error: err.message };
    }
}