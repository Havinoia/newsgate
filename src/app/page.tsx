import NewsFeed from "@/components/NewsFeed";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto mt-12 mb-8">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
          The Future of News.
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">
          Agregator berita real-time dengan update detik demi detik. Jangan sampai ketinggalan informasi.
        </p>
      </div>

      {/* Main Content Area: News Feed Component */}
      <Suspense fallback={<div className="animate-pulse">Loading Feed...</div>}>
          <NewsFeed initialCategory="all" initialSearch="" />
      </Suspense>
    </div>
  );
}
