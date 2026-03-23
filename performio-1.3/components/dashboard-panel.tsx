"use client"

import * as React from "react"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

type DashboardPanelProps = {
    children: React.ReactNode
    isAdmin: boolean
    user: {
        name: string
        email: string
        avatar?: string
    }
}

export function DashboardPanel({
    children,
    isAdmin,
    user,
}: DashboardPanelProps) {
    return (
        <SidebarProvider defaultOpen>
            <AppSidebar isAdmin={isAdmin} user={user} />

            <SidebarInset className="min-h-screen">
                <header className="flex h-8 shrink-0 items-center gap-3 bg-background px-3">
                    <SidebarTrigger />
                    <h1 className="text-sm font-semibold tracking-tight">
                        {isAdmin ? "" : ""}
                    </h1>
                </header>

                <main className="flex-1 min-w-0 p-6">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    )
}