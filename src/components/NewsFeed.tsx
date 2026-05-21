"use client";
 
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNewsArticles } from "@/actions/news";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

interface NewsFeedProps {
    initialCategory?: string;
    initialSearch?: string;
    sortBy?: string;
    onSelectArticle?: (article: any) => void;
    selectedArticleId?: string | number;
}

const getRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInMs = now.getTime() - then.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMins < 1) return 'JUST NOW';
    if (diffInMins < 60) return `${diffInMins}M AGO`;
    if (diffInHours < 24) return `${diffInHours}H AGO`;
    
    return then.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase();
};

export default function NewsFeed({ 
    initialCategory = "all", 
    initialSearch = "",
    sortBy = "latest",
    onSelectArticle,
    selectedArticleId
}: NewsFeedProps) {
    const [limit, setLimit] = useState<number>(20);

    // Reset limit when filter changes
    useEffect(() => {
        setLimit(20);
    }, [initialCategory, initialSearch, sortBy]);

    // TanStack Query untuk fetching data dengan limit dinamis
    const { data: articles, refetch, isFetching } = useQuery({
        queryKey: ["articles", initialCategory, initialSearch, sortBy, limit],
        queryFn: async () => {
            const res = await getNewsArticles({ 
                category: initialCategory, 
                query: initialSearch,
                sortBy: sortBy,
                limit: limit
            });
            if (res.success) return res.data;
            throw new Error(res.error);
        },
        placeholderData: (previousData) => previousData,
        refetchInterval: 5000, // Fetch every 5 seconds for genuine real-time updates
    });

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        // Pemicu ketika discroll mendekati bawah (threshold 20px)
        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 20) {
            if (!isFetching) {
                // Tambah limit untuk mengambil berita lebih lama (hingga 7 hari ke belakang)
                setLimit((prev) => prev + 15);
            }
        }
    };

    // Auto-select first article on load
    useEffect(() => {
        if (articles && articles.length > 0 && !selectedArticleId && onSelectArticle) {
            onSelectArticle(articles[0]);
        }
    }, [articles, selectedArticleId, onSelectArticle]);

    // Supabase Realtime Listener
    useEffect(() => {
        const supabase = createClient();
        
        const channel = supabase.channel(`realtime_news_${initialCategory}`)
            .on(
                'postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'news_article' }, 
                () => {
                    refetch();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [initialCategory, refetch]);

    if (!articles && isFetching) {
        return (
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50 shrink-0">
                    <h3 className="font-headline-md text-sm text-on-surface uppercase tracking-[0.1em] font-black">Intelligence Stream</h3>
                    <button 
                        disabled
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border border-outline-variant/20 text-on-surface-variant opacity-50 cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                        Refreshing...
                    </button>
                </div>
                <div className="flex-1 flex flex-col gap-4 p-4 animate-pulse overflow-y-auto no-scrollbar">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="p-4 border-b border-outline-variant/10 space-y-3">
                            <div className="flex justify-between">
                                <div className="h-3 w-16 bg-surface-container-high rounded"></div>
                                <div className="h-3 w-12 bg-surface-container-high rounded"></div>
                            </div>
                            <div className="h-4 w-full bg-surface-container-high rounded"></div>
                            <div className="h-3 w-2/3 bg-surface-container-high rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!articles || articles.length === 0) {
        return (
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50 shrink-0">
                    <h3 className="font-headline-md text-sm text-on-surface uppercase tracking-[0.1em] font-black">Intelligence Stream</h3>
                    <button 
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border border-outline-variant/20 hover:border-secondary/40 hover:bg-secondary/10 active:scale-95 text-on-surface-variant hover:text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className={`material-symbols-outlined text-[14px] ${isFetching ? 'animate-spin' : ''}`}>sync</span>
                        {isFetching ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
                <div className="p-8 text-center text-on-surface-variant font-label-caps text-xs flex-1 flex flex-col justify-center">
                    NO INTELLIGENCE DETECTED
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header / Controls Bar */}
            <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50 shrink-0">
                <h3 className="font-headline-md text-sm text-on-surface uppercase tracking-[0.1em] font-black">Intelligence Stream</h3>
                <button 
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border border-outline-variant/20 hover:border-secondary/40 hover:bg-secondary/10 active:scale-95 text-on-surface-variant hover:text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Manual Refresh"
                >
                    <span className={`material-symbols-outlined text-[14px] ${isFetching ? 'animate-spin' : ''}`}>sync</span>
                    {isFetching ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            <div 
                onScroll={handleScroll}
                className="flex-1 flex flex-col overflow-y-auto no-scrollbar"
            >
                <AnimatePresence mode="popLayout">
                    {articles.map((article, index) => {
                        const isSelected = selectedArticleId === article.id;
                        
                        return (
                            <motion.div 
                                key={article.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => onSelectArticle?.(article)}
                                className={`p-4 border-b border-outline-variant/10 cursor-pointer transition-all hover:bg-surface-variant/20 group relative ${isSelected ? 'bg-secondary-container/10 border-l-4 border-l-secondary' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[9px] font-black text-secondary tracking-[0.15em] uppercase px-2 py-0.5 bg-secondary/10 rounded-md border border-secondary/20">
                                        {article.category}
                                    </span>
                                    <span className="text-[9px] font-bold text-outline tracking-wider flex items-center gap-1.5 bg-surface-container-high px-2 py-0.5 rounded-md">
                                        <span className="material-symbols-outlined text-[12px] text-secondary">schedule</span>
                                        {new Date(article.publishedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} | {new Date(article.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase()}
                                    </span>
                                </div>
                                
                                <a 
                                    href={article.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="block font-bold text-[13px] text-on-surface leading-tight mb-2 hover:text-secondary transition-colors uppercase tracking-tight"
                                >
                                    {article.title}
                                </a>
                                
                                <div className="flex items-center gap-4 text-[10px] text-outline font-label-caps tracking-wider">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">bolt</span> 
                                        {article.sentimentScore >= 70 ? "HIGH IMPACT" : article.sentimentScore >= 40 ? "MID IMPACT" : "LOW IMPACT"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">share</span> 
                                        {article.source?.name?.toUpperCase() || "SOURCE"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">menu_book</span> 
                                        {Math.max(1, Math.ceil((article.content?.split(/\s+/).length || 0) / 200))} MIN READ
                                    </span>
                                </div>

                                {isSelected && (
                                    <div className="absolute top-4 right-4">
                                        <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping"></div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {isFetching && articles.length > 0 && (
                    <div className="p-4 text-center text-[10px] font-label-caps text-secondary animate-pulse flex items-center justify-center gap-2 border-t border-outline-variant/10 bg-surface-container-low/20">
                        <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                        RETRIEVING OLDER INTELLIGENCE NODES...
                    </div>
                )}
            </div>
        </div>
    );
}
