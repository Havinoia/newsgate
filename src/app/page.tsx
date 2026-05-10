import NewsFeed from "@/components/NewsFeed";
import { Suspense } from "react";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category = "all", q = "" } = await searchParams;

  return (
    <div className="flex flex-col gap-8">
      {/* Main Content Area: News Feed Component */}
      <Suspense fallback={<div className="text-center py-20 text-on-surface-variant font-body-md animate-pulse">Connecting to news center...</div>}>
          <NewsFeed initialCategory={category} initialSearch={q} />
      </Suspense>
    </div>
  );
}
