"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNewsArticles } from "@/actions/news";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

interface NewsFeedProps {
    initialCategory?: string;
    initialSearch?: string;
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
    onSelectArticle,
    selectedArticleId
}: NewsFeedProps) {
    // TanStack Query untuk fetching data
    const { data: articles, refetch, isFetching } = useQuery({
        queryKey: ["articles", initialCategory, initialSearch],
        queryFn: async () => {
            const res = await getNewsArticles({ category: initialCategory, query: initialSearch });
            if (res.success) return res.data;
            throw new Error(res.error);
        },
        placeholderData: (previousData) => previousData,
        staleTime: 60 * 1000 * 5, // 5 menit cache
    });

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
            <div className="flex-1 flex flex-col gap-4 p-4 animate-pulse">
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
        );
    }

    if (!articles || articles.length === 0) {
        return <div className="p-8 text-center text-on-surface-variant font-label-caps text-xs">NO INTELLIGENCE DETECTED</div>;
    }

    return (
        <div className={`flex-1 flex flex-col overflow-y-auto no-scrollbar transition-opacity duration-300 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
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
                            <div className="flex justify-between items-start mb-2">
                                <span className={`font-label-caps text-[9px] px-2 py-0.5 rounded tracking-widest font-black ${
                                    isSelected ? 'bg-secondary text-on-secondary' : 'bg-surface-variant text-on-surface-variant'
                                }`}>
                                    {article.category?.toUpperCase() || "INTEL"}
                                </span>
                                <span className="font-data-point text-[10px] text-outline font-medium tracking-tighter">
                                    {getRelativeTime(article.publishedAt)}
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
                                    {index < 3 ? "HIGH IMPACT" : "MID IMPACT"}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">share</span> 
                                    {article.source?.name?.toUpperCase() || "SOURCE"}
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
        </div>
    );
}
