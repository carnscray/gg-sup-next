'use server';

import { createClient } from "@/lib/supabase/server";

export async function fetchWeeklyRevenue(startDate: string, endDate: string) {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase.rpc('get_weekly_revenue', {
            start_date: startDate,
            end_date: endDate
        });

        if (error) {
            console.error("Supabase RPC error fetching weekly revenue:", error.message);
            return { success: false, data: [], error: error.message };
        }

        // Format the data for the Shadcn line chart
        const formattedData = data.map((row: any) => ({
            // Converts "2026-01-11" into something clean like "Jan 11"
            week: new Date(row.week_ending).toLocaleDateString('en-AU', {
                month: 'short',
                day: 'numeric'
            }),
            revenue: Number(row.total_revenue)
        }));

        return { success: true, data: formattedData, error: null };

    } catch (err: any) {
        console.error("Unexpected error in fetchWeeklyRevenue:", err);
        return { success: false, data: [], error: err.message || "An unexpected error occurred" };
    }
}