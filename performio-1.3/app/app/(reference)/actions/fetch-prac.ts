'use server';

import { createClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from "next/cache";

export async function fetchPractitioners() {
    noStore(); // Opts this fetch out of Next.js caching

    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('prac')
            .select('*')
            .order('prac_active', { ascending: false })
            .order('prac_lastname', { ascending: true });

        if (error) {
            console.error("Supabase error fetching practitioners:", error.message);
            return { success: false, data: null, error: error.message };
        }

        return { success: true, data, error: null };
    } catch (err: any) {
        console.error("Unexpected error in fetchPractitioners:", err);
        return { success: false, data: null, error: err.message || "An unexpected error occurred" };
    }
}