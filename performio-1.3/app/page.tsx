import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { ChartNoAxesCombined } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex-1 w-full flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-8 p-5">
          <div className="flex items-center gap-4">
            <ChartNoAxesCombined className="w-12 h-12" />
            <h1 className="text-6xl font-bold tracking-tight">performio</h1>
          </div>
          <p className="text-xl text-muted-foreground text-center max-w-md">
            Data visualization and reporting tool powered by Supabase.
          </p>
          <Button asChild size="lg" className="mt-4">
            <Link href="/app/dashboard">Go to Dashboard</Link>
          </Button>
        </div>

        <footer className="w-full mt-auto flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <div className="flex items-center gap-2">
            <ChartNoAxesCombined className="w-4 h-4" />
            <span className="font-bold">performio</span>
          </div>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
