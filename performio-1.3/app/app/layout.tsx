import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardPanel } from "@/components/dashboard-panel"
import { Skeleton } from "@/components/ui/skeleton"

function DashboardShellFallback() {
    return (
        <div className="flex min-h-screen w-full">
            <div className="hidden w-64 border-r bg-sidebar md:block" />
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-16 shrink-0 items-center gap-3 border-b bg-background px-6">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-4 w-32" />
                </header>
                <main className="flex-1 p-6">
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </main>
            </div>
        </div>
    )
}

async function DashboardLayoutContent({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    const { data: profile } = await supabase
        .from("users")
        .select("display_name, first_name, last_name, is_admin")
        .eq("id", user.id)
        .single()

    const displayName =
        profile?.display_name ||
        [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
        user.email?.split("@")[0] ||
        "User"

    return (
        <DashboardPanel
            isAdmin={!!profile?.is_admin}
            user={{
                name: displayName,
                email: user.email ?? "",
            }}
        >
            {children}
        </DashboardPanel>
    )
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Suspense fallback={<DashboardShellFallback />}>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </Suspense>
    )
}