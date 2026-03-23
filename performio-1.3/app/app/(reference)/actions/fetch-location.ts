'use server';

import { createClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from "next/cache";

export async function fetchLocations() {
    noStore();

    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('location')
            .select('*')
            .order('loc_is_active', { ascending: false }) // Active (true) at the top
            .order('loc_name', { ascending: true });      // Then alphabetical

        if (error) {
            console.error("Supabase error fetching locations:", error.message);
            return { success: false, data: null, error: error.message };
        }

        return { success: true, data, error: null };
    } catch (err: any) {
        console.error("Unexpected error in fetchLocations:", err);
        return { success: false, data: null, error: err.message || "An unexpected error occurred" };
    }
}