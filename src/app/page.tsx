"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getNewsArticles } from "@/actions/news";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import ArticleModal from "@/components/ArticleModal";

function NewsPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = searchParams.get("category") || "all";
  const searchParam = searchParams.get("q") || "";
  const sortParam = searchParams.get("sort") || "latest";
  const timeParam = searchParams.get("time") || "all";

  const [activeCategory, setActiveCategory] = useState<string>(categoryParam);
  const [activeSort, setActiveSort] = useState<string>(sortParam);
  const [activeTimeRange, setActiveTimeRange] = useState<string>(timeParam);
  const [searchQuery, setSearchQuery] = useState<string>(searchParam);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  // Sync state with URL params
  useEffect(() => {
    setActiveCategory(searchParams.get("category") || "all");
    setActiveSort(searchParams.get("sort") || "latest");
    setActiveTimeRange(searchParams.get("time") || "all");
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Fetch articles with TanStack Query
  const { data: articles, refetch, isFetching } = useQuery({
    queryKey: ["portal-news", activeCategory, searchQuery, activeSort, activeTimeRange],
    queryFn: async () => {
      const res = await getNewsArticles({
        category: activeCategory,
        query: searchQuery,
        sortBy: activeSort,
        timeRange: activeTimeRange,
        limit: 30,
      });
      if (res && res.data) return res.data;
      return [];
    },
    refetchInterval: 10000,
  });

  // Supabase Realtime update subscriber
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("portal_realtime_news")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "news_article" }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const updateFilters = (newCategory?: string, newSort?: string, newTime?: string) => {
    const params = new URLSearchParams();
    const cat = newCategory !== undefined ? newCategory : activeCategory;
    const s = newSort !== undefined ? newSort : activeSort;
    const t = newTime !== undefined ? newTime : activeTimeRange;

    if (cat && cat !== "all") params.set("category", cat);
    if (s && s !== "latest") params.set("sort", s);
    if (t && t !== "all") params.set("time", t);
    if (searchQuery) params.set("q", searchQuery);

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : "/");
  };

  const categories = [
    { id: "all", label: "Semua", icon: "apps" },
    { id: "politics", label: "Politik & Dunia", icon: "gavel" },
    { id: "crypto", label: "Kripto & Web3", icon: "currency_bitcoin" },
    { id: "technology", label: "Teknologi", icon: "memory" },
    { id: "energy", label: "Energi", icon: "bolt" },
    { id: "markets", label: "Pasar Global", icon: "trending_up" },
  ];

  const categoryPillsStyle = (cat: string) => {
    const c = (cat || "").toLowerCase();
    if (c === "crypto") return "bg-secondary/15 text-secondary border-secondary/30";
    if (c === "politics") return "bg-error/15 text-error border-error/30";
    if (c === "energy") return "bg-tertiary/15 text-tertiary border-tertiary/30";
    return "bg-surface-container-high text-on-surface-variant border-outline-variant/20";
  };

  const featuredArticle = articles && articles.length > 0 ? articles[0] : null;
  const remainingArticles = articles && articles.length > 1 ? articles.slice(1) : [];

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Search & Filter Header Bar */}
      <section className="bg-surface-container-lowest/80 border border-outline-variant/20 rounded-2xl p-4 sm:p-5 glass-panel flex flex-col gap-4 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/15 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse shadow-[0_0_10px_rgba(180,197,255,0.8)]" />
              <h1 className="text-lg font-black tracking-tight text-on-surface uppercase">
                NewsGate Monitoring Hub
              </h1>
            </div>
            <p className="text-xs text-on-surface-variant font-medium">
              Pemantauan Berita Terkini, Analisis Dampak Sentimen, & Agregasi Real-Time
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[16px] ${isFetching ? "animate-spin" : ""}`}>
                sync
              </span>
              <span>{isFetching ? "Menyingkronkan..." : "Perbarui Feed"}</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => updateFilters(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? "bg-secondary text-on-secondary border-secondary shadow-md shadow-secondary/20"
                      : "bg-surface-container-low/60 border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sort & Time Filters */}
          <div className="flex items-center gap-2">
            {/* Sort Selector */}
            <select
              value={activeSort}
              onChange={(e) => updateFilters(undefined, e.target.value)}
              className="bg-surface-container-low/80 border border-outline-variant/25 rounded-xl px-3 py-1.5 text-xs font-bold text-on-surface focus:outline-none focus:border-secondary transition-colors cursor-pointer"
            >
              <option value="latest">Urutkan: Terkini</option>
              <option value="impact">Urutkan: High Impact</option>
              <option value="oldest">Urutkan: Terlama</option>
            </select>

            {/* Time Selector */}
            <select
              value={activeTimeRange}
              onChange={(e) => updateFilters(undefined, undefined, e.target.value)}
              className="bg-surface-container-low/80 border border-outline-variant/25 rounded-xl px-3 py-1.5 text-xs font-bold text-on-surface focus:outline-none focus:border-secondary transition-colors cursor-pointer"
            >
              <option value="all">Waktu: Semua</option>
              <option value="last-6-hours">6 Jam Terakhir</option>
              <option value="last-24-hours">24 Jam Terakhir</option>
              <option value="last-7-days">7 Hari Terakhir</option>
            </select>
          </div>
        </div>

        {/* Active Search Indicator if any */}
        {searchQuery && (
          <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/10 text-xs text-on-surface-variant">
            <span>Menampilkan hasil pencarian untuk: <strong className="text-secondary">"{searchQuery}"</strong></span>
            <button
              onClick={() => {
                setSearchQuery("");
                router.push("/");
              }}
              className="text-error underline text-[11px] font-bold hover:opacity-80"
            >
              Hapus Pencarian
            </button>
          </div>
        )}
      </section>

      {/* Loading Skeleton State */}
      {!articles && isFetching && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div className="md:col-span-2 h-96 rounded-2xl bg-surface-container-low border border-outline-variant/20" />
          <div className="h-96 rounded-2xl bg-surface-container-low border border-outline-variant/20" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-surface-container-low border border-outline-variant/20" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {articles && articles.length === 0 && (
        <div className="bg-surface-container-lowest/80 border border-outline-variant/20 rounded-2xl p-12 text-center glass-panel space-y-4">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto text-outline">
            <span className="material-symbols-outlined text-[36px]">search_off</span>
          </div>
          <h3 className="text-lg font-black text-on-surface uppercase tracking-wide">
            Tidak Ada Berita Ditemukan
          </h3>
          <p className="text-xs text-on-surface-variant max-w-md mx-auto">
            Tidak ada artikel yang cocok dengan kriteria filter atau pencarian Anda. Coba ganti kata kunci atau pilih kategori lain.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              updateFilters("all", "latest", "all");
            }}
            className="px-4 py-2 rounded-xl bg-secondary text-on-secondary font-bold text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

      {/* Content Layout: Hero + Article Grid */}
      {articles && articles.length > 0 && (
        <div className="space-y-6">
          {/* Hero Showcase Section (First Article) */}
          {featuredArticle && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setSelectedArticle(featuredArticle)}
              className="relative rounded-2xl overflow-hidden border border-outline-variant/25 glass-panel group cursor-pointer shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[360px]"
            >
              {/* Image side or Banner */}
              <div className="lg:col-span-7 relative overflow-hidden min-h-[240px] lg:min-h-full bg-surface-container-high">
                {featuredArticle.imageUrl ? (
                  <img
                    src={featuredArticle.imageUrl}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-surface-container-high via-surface-container to-background p-8 flex flex-col justify-center items-center text-center">
                    <span className="material-symbols-outlined text-[64px] text-secondary/30 mb-2">newspaper</span>
                    <span className="font-label-caps text-xs text-outline uppercase tracking-widest font-bold">NewsGate Headline Stream</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-background via-background/60 to-transparent" />
              </div>

              {/* Text side */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-surface-container-lowest/90 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${categoryPillsStyle(featuredArticle.category)}`}>
                      {featuredArticle.category || "Headline"}
                    </span>

                    <span className="text-[10px] font-bold text-outline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-secondary">schedule</span>
                      {new Date(featuredArticle.publishedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-on-surface group-hover:text-secondary transition-colors leading-snug">
                    {featuredArticle.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-on-surface-variant line-clamp-3 leading-relaxed font-body-md">
                    {featuredArticle.content || "Klik untuk membaca selengkapnya laporan berita ini dari sumber portal terkini..."}
                  </p>
                </div>

                <div className="pt-6 border-t border-outline-variant/15 flex items-center justify-between text-xs mt-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-outline">
                      {featuredArticle.source?.name || "News Feed"}
                    </span>
                    <span className="text-[10px] font-black text-error px-2 py-0.5 rounded bg-error/10 border border-error/20">
                      {featuredArticle.sentimentScore >= 70 ? "HIGH IMPACT" : "REGULAR"}
                    </span>
                  </div>

                  <button className="px-4 py-2 rounded-xl bg-secondary/15 hover:bg-secondary text-secondary hover:text-on-secondary border border-secondary/30 font-bold text-xs transition-all flex items-center gap-1.5">
                    <span>Baca</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Remaining Articles Grid Header */}
          <div className="flex items-center justify-between pt-4 border-b border-outline-variant/15 pb-3">
            <h3 className="text-sm font-black text-on-surface uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">feed</span>
              Berita Terkini ({remainingArticles.length + 1} Artikel)
            </h3>
            <span className="text-xs text-outline font-label-caps font-bold">
              STREAM SYNCHRONIZED
            </span>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {remainingArticles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.5) }}
                onClick={() => setSelectedArticle(article)}
                className="bg-surface-container-lowest/80 border border-outline-variant/20 rounded-2xl overflow-hidden glass-panel hover:border-secondary/40 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-1"
              >
                {/* Thumbnail Header if image available */}
                {article.imageUrl ? (
                  <div className="h-44 w-full overflow-hidden relative bg-surface-container-high">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 z-10">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${categoryPillsStyle(article.category)}`}>
                        {article.category}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/40">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${categoryPillsStyle(article.category)}`}>
                      {article.category}
                    </span>
                    <span className="text-[10px] font-bold text-outline">
                      {new Date(article.publishedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

                {/* Article Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {article.imageUrl && (
                      <div className="text-[10px] font-bold text-outline mb-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-secondary">schedule</span>
                        {new Date(article.publishedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}

                    <h4 className="font-bold text-sm text-on-surface group-hover:text-secondary transition-colors leading-snug line-clamp-2 mb-2">
                      {article.title}
                    </h4>

                    <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed font-body-md">
                      {article.content || "Klik untuk membaca konten selengkapnya..."}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-outline-variant/10 flex items-center justify-between text-[10px] text-outline font-label-caps font-bold">
                    <span className="flex items-center gap-1 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[13px] text-secondary">share</span>
                      {article.source?.name || "NEWS SOURCE"}
                    </span>

                    <span className={`flex items-center gap-0.5 font-black ${article.sentimentScore >= 70 ? 'text-error' : 'text-secondary'}`}>
                      <span className="material-symbols-outlined text-[12px]">bolt</span>
                      {article.sentimentScore >= 70 ? "HIGH IMPACT" : "NORMAL"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Article Reader Modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant opacity-60 space-y-4 py-24 bg-background min-h-screen">
          <span className="material-symbols-outlined text-[48px] animate-spin text-secondary">sync</span>
          <p className="font-label-caps text-xs tracking-widest uppercase font-bold">
            Memuat NewsGate Portal Berita...
          </p>
        </div>
      }
    >
      <NewsPortalContent />
    </Suspense>
  );
}
