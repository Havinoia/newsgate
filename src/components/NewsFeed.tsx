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
 
    // TanStack Query for dynamic limit queries
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
        refetchInterval: 5000, // Sync every 5 seconds
    });
 
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 20) {
            if (!isFetching) {
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
 
    // Category specific pill colors mapping
    const getCategoryPillStyle = (cat: string) => {
        const c = cat.toLowerCase();
        if (c === "crypto") return "text-secondary bg-secondary/15 border-secondary/30";
        if (c === "politics") return "text-error bg-error/15 border-error/30";
        if (c === "energy") return "text-tertiary bg-tertiary/15 border-tertiary/30";
        return "text-outline bg-surface-container border-outline-variant/30";
    };

    if (!articles && isFetching) {
        return (
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50 shrink-0">
                    <h3 className="font-headline-md text-sm text-on-surface uppercase tracking-[0.1em] font-black">Intelligence Stream</h3>
                    <button 
                        disabled
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-outline-variant/20 text-on-surface-variant opacity-50 cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                        Syncing...
                    </button>
                </div>
                <div className="flex-1 flex flex-col gap-3 p-4 animate-pulse overflow-y-auto no-scrollbar">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-4 rounded-xl border border-outline-variant/10 space-y-3 bg-surface-container-low/20">
                            <div className="flex justify-between">
                                <div className="h-3.5 w-16 bg-surface-container-high rounded" />
                                <div className="h-3.5 w-12 bg-surface-container-high rounded" />
                            </div>
                            <div className="h-4 w-full bg-surface-container-high rounded" />
                            <div className="h-3.5 w-2/3 bg-surface-container-high rounded" />
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
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-outline-variant/20 hover:border-secondary/40 hover:bg-secondary/10 active:scale-95 text-on-surface-variant hover:text-secondary disabled:opacity-50"
                    >
                        <span className={`material-symbols-outlined text-[14px] ${isFetching ? 'animate-spin' : ''}`}>sync</span>
                        {isFetching ? 'Syncing...' : 'Sync Feed'}
                    </button>
                </div>
                <div className="p-8 text-center text-on-surface-variant font-label-caps text-xs flex-1 flex flex-col justify-center">
                    NO INTELLIGENCE STREAM DETECTED
                </div>
            </div>
        );
    }
 
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header / Controls Bar */}
            <div className="p-4 border-b border-outline-variant/15 flex justify-between items-center bg-surface-container-low/40 shrink-0 z-10">
                <h3 className="font-headline-md text-sm text-on-surface uppercase tracking-[0.12em] font-black text-glow" style={{ color: "var(--color-on-surface)" }}>Intelligence Stream</h3>
                <button 
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-outline-variant/20 hover:border-secondary/40 hover:bg-secondary/10 active:scale-95 text-on-surface-variant hover:text-secondary disabled:opacity-50"
                    title="Manual Refresh"
                >
                    <span className={`material-symbols-outlined text-[14px] ${isFetching ? 'animate-spin' : ''}`}>sync</span>
                    {isFetching ? 'Syncing...' : 'Sync Feed'}
                </button>
            </div>
 
            <div 
                onScroll={handleScroll}
                className="flex-1 flex flex-col overflow-y-auto no-scrollbar p-3 space-y-3"
            >
                <AnimatePresence mode="popLayout">
                    {articles.map((article, index) => {
                        const isSelected = selectedArticleId === article.id;
                        
                        return (
                            <motion.div 
                                key={article.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
                                onClick={() => onSelectArticle?.(article)}
                                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 relative group border ${
                                    isSelected 
                                      ? 'glass-panel glass-glow-blue border-l-4 border-l-secondary' 
                                      : 'bg-surface-container-low/20 border-outline-variant/10 hover:border-outline-variant/30 hover:bg-surface-container-low/40 hover:translate-x-1'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-[9px] font-black tracking-[0.18em] uppercase px-2 py-0.5 rounded-md border ${getCategoryPillStyle(article.category)}`}>
                                        {article.category}
                                    </span>
                                    <span className="text-[9px] font-bold text-outline tracking-wider flex items-center gap-1 bg-surface-container/60 px-2 py-0.5 rounded-md border border-outline-variant/5">
                                        <span className="material-symbols-outlined text-[12px] text-secondary">schedule</span>
                                        {new Date(article.publishedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} | {new Date(article.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase()}
                                    </span>
                                </div>
                                
                                <a 
                                    href={article.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="block font-black text-[13px] text-on-surface leading-snug mb-3 hover:text-secondary transition-colors uppercase tracking-tight"
                                >
                                    {article.title}
                                </a>
                                
                                <div className="flex items-center gap-4 text-[9px] text-outline font-label-caps tracking-wider border-t border-outline-variant/5 pt-2">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[13px] text-secondary">bolt</span> 
                                        {article.sentimentScore >= 70 ? "HIGH IMPACT" : article.sentimentScore >= 40 ? "MID IMPACT" : "LOW IMPACT"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[13px]">share</span> 
                                        {article.source?.name?.toUpperCase() || "SOURCE"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[13px]">menu_book</span> 
                                        {Math.max(1, Math.ceil((article.content?.split(/\s+/).length || 0) / 200))} MIN READ
                                    </span>
                                </div>
 
                                {isSelected && (
                                    <div className="absolute top-4 right-4">
                                        <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping" />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
 
                {isFetching && articles.length > 0 && (
                    <div className="p-4 text-center text-[9px] font-label-caps text-secondary animate-pulse flex items-center justify-center gap-2 border border-outline-variant/10 rounded-xl bg-surface-container-low/20 z-0">
                        <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                        RETRIEVING SECURE INTELLIGENCE NODES...
                    </div>
                )}
            </div>
        </div>
    );
}
