import Link from "next/link";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">TaskVision</h1>
        <div className="flex gap-2">
          <Link
            href={`/${locale === "ja" ? "en" : "ja"}`}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
          >
            {locale === "ja" ? "EN" : "JA"}
          </Link>
        </div>
      </div>

      <DashboardClient locale={locale} />
    </main>
  );
}
