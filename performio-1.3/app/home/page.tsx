import Link from "next/link"

export default function Page() {
    return (
        <main className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 text-center">
                <h1 className="text-3xl font-bold">
                    Melbourne Pregnancy &amp; Pelvic Physio
                </h1>

                <Link
                    href="/app"
                    className="rounded-md bg-primary px-6 py-2 text-white"
                >
                    App
                </Link>
            </div>
        </main>
    )
}