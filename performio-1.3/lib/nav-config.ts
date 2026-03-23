import { LayoutDashboard, PieChart, FileText, Home } from "lucide-react";

export const navConfig = {
    topLinks: [

    ],
    navMain: [
        {
            title: "Home",
            url: "/app",
            icon: Home,
            isActive: true,
            requiresAdmin: false,
        },

        {
            title: "Dashboard",
            url: "/app/dashboard",
            icon: LayoutDashboard,
            isActive: true,
            requiresAdmin: true,
        },

        {
            title: "Analyse",
            url: "#",
            icon: PieChart,

            items: [

                {
                    title: "Matrix",
                    url: "/app/matrix",
                    requiresAdmin: true,
                },
            ],
        },
        {
            title: "Reference",
            url: "#",
            icon: FileText,
            requiresAdmin: true,
            items: [
                { title: "Location", url: "/app/location", requiresAdmin: true, },
                { title: "Practitioner", url: "/app/prac", requiresAdmin: true, },
                { title: "Appointment Types", url: "/app/apptype", requiresAdmin: true, },
            ],
        },
    ],
};