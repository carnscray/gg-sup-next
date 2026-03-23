//performio-1.3/app/app/actions/fetch-apptype.ts
'use server';

import { createClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from "next/cache";

export async function fetchAppTypes() {
    noStore();

    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('apptype')
            .select('*')
            .order('apptype_name', { ascending: true });

        if (error) {
            console.error("Supabase error fetching appointment types:", error.message);
            return { success: false, data: null, error: error.message };
        }

        return { success: true, data, error: null };
    } catch (err: any) {
        console.error("Unexpected error in fetchAppTypes:", err);
        return { success: false, data: null, error: err.message || "An unexpected error occurred" };
    }
}