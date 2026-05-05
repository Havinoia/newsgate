"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNewsArticles } from "@/actions/news";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, TrendingUp, ExternalLink } from "lucide-react";
// Asumsi ada setup client supabase sederhana di proyek ini:
// import { supabase } from "@/lib/supabase";

interface NewsFeedProps {
    initialCategory?: string;
    initialSearch?: string;
}

export default function NewsFeed({ initialCategory = "all", initialSearch = "" }: NewsFeedProps) {
    const [hasNewUpdate, setHasNewUpdate] = useState(false);

    // TanStack Query untuk fetching data
    const { data: articles, refetch, isLoading } = useQuery({
        queryKey: ["articles", initialCategory, initialSearch],
        queryFn: async () => {
            const res = await getNewsArticles({ category: initialCategory, query: initialSearch });
            if (res.success) return res.data;
            throw new Error(res.error);
        },
        staleTime: 60 * 1000 * 5, // 5 menit cache
    });

    // Dummy Realtime Listener: Ganti setInterval ini dengan Supabase Realtime / SSE
    useEffect(() => {
        /* 
        // Contoh Implementasi Supabase Realtime
        const channel = supabase.channel('realtime_news')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news_article' }, (payload) => {
                setHasNewUpdate(true); // Memunculkan tombol "New Update"
            })
            .subscribe();
        return () => supabase.removeChannel(channel);
        */

        // Simulasi berita baru masuk setiap 30 detik untuk demo animasi
        const timer = setInterval(() => {
            setHasNewUpdate(true);
        }, 30000);
        return () => clearInterval(timer);
    }, []);

    const handleRefresh = () => {
        refetch();
        setHasNewUpdate(false);
    };

    if (isLoading) return <div className="text-center py-20 text-gray-500 animate-pulse">Memuat berita terbaru...</div>;

    return (
        <div className="max-w-6xl mx-auto w-full relative">
            {/* Animasi "New Updates Available" */}
            <AnimatePresence>
                {hasNewUpdate && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
                    >
                        <button 
                            onClick={handleRefresh}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-xl shadow-blue-500/30 font-medium flex items-center gap-2 transition-all"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Berita Baru Tersedia
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grid Layout untuk Berita (Bento/Masonry Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                <AnimatePresence>
                    {articles?.map((article, index) => (
                        <motion.a
                            href={article.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={article.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            layout
                            className={`group relative flex flex-col bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-zinc-100 dark:border-zinc-800 ${
                                index === 0 ? "md:col-span-2 md:row-span-2" : "" // Berita utama lebih besar
                            }`}
                        >
                            {/* Gambar Cover */}
                            <div className="relative w-full aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                {article.imageUrl ? (
                                    <img 
                                        src={article.imageUrl} 
                                        alt={article.title} 
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-zinc-400">No Image</div>
                                )}
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                                
                                {/* Kategori Badge */}
                                <span className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {article.category}
                                </span>
                            </div>

                            {/* Konten */}
                            <div className="p-6 flex-1 flex flex-col justify-between absolute bottom-0 w-full z-10 text-white">
                                <div>
                                    <h2 className={`font-bold leading-tight tracking-tight drop-shadow-md ${
                                        index === 0 ? "text-2xl md:text-3xl lg:text-4xl" : "text-xl"
                                    } group-hover:text-blue-300 transition-colors line-clamp-3`}>
                                        {article.title}
                                    </h2>
                                </div>
                                
                                {/* Metadata Source & Time */}
                                <div className="mt-4 flex items-center justify-between text-sm text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        {article.source?.iconUrl ? (
                                            <img src={article.source.iconUrl} className="w-5 h-5 rounded-full" alt="source" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                                                {article.source?.name.charAt(0)}
                                            </div>
                                        )}
                                        <span className="font-medium text-white drop-shadow-sm">{article.source?.name || "Unknown Source"}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-80">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>
                                            {new Intl.DateTimeFormat("id-ID", { hour: '2-digit', minute: '2-digit' }).format(new Date(article.publishedAt))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Hover Icon Ext */}
                            <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                <ExternalLink className="w-4 h-4" />
                            </div>
                        </motion.a>
                    ))}
                </AnimatePresence>
            </div>
            {articles?.length === 0 && (
                <div className="text-center py-20 text-gray-500">Tidak ada berita yang ditemukan.</div>
            )}
        </div>
    );
}
