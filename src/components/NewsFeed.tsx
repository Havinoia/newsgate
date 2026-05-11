"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNewsArticles } from "@/actions/news";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

interface NewsFeedProps {
    initialCategory?: string;
    initialSearch?: string;
}

export default function NewsFeed({ initialCategory = "all", initialSearch = "" }: NewsFeedProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' 
                ? scrollLeft - clientWidth 
                : scrollLeft + clientWidth;
            
            scrollRef.current.scrollTo({
                left: scrollTo,
                behavior: 'smooth'
            });
        }
    };

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

    if (isLoading) return <div className="text-center py-20 text-on-surface-variant font-body-md animate-pulse">Connecting to the news center...</div>;

    if (!articles || articles.length === 0) {
        return <div className="text-center py-20 text-on-surface-variant font-body-md">No news found for this category.</div>;
    }

    const breakingStory = articles[0];
    const sideStories = articles.slice(1, 3);
    const trendingStories = articles.slice(3);

    return (
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            {/* Hero Bento Grid Section */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-bento-gap mb-16">
                {/* Breaking Story (Large Card) */}
                {breakingStory && (
                    <motion.a 
                        href={breakingStory.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:col-span-8 group relative overflow-hidden rounded-xl bg-surface-container-high bento-card-glow breaking-news-glow aspect-video md:aspect-auto md:h-[600px] transition-transform duration-500 hover:scale-[1.01]"
                    >
                        <img 
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                            src={breakingStory.imageUrl || "https://picsum.photos/seed/breaking/1200/800"} 
                            alt={breakingStory.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
                        
                        <div className="absolute top-6 left-6 flex items-center gap-2">
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                            </span>
                            <span className="font-label-caps text-xs font-semibold text-secondary tracking-widest uppercase">LIVE UPDATE</span>
                        </div>

                        <div className="absolute bottom-0 left-0 p-8 w-full">
                            <p className="font-label-caps text-xs font-bold text-secondary mb-3 uppercase tracking-widest">{breakingStory.category}</p>
                            <h1 className="font-display-xl text-3xl md:text-5xl font-black text-on-surface mb-4 max-w-2xl leading-tight">
                                {breakingStory.title}
                            </h1>
                            <div className="flex items-center gap-4 text-on-surface-variant font-data-point text-xs">
                                <span className="font-medium uppercase tracking-wider">{breakingStory.source?.name} • {new Date(breakingStory.publishedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} EST</span>
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">visibility</span> {Math.floor(Math.random() * 20)}k
                                </span>
                            </div>
                        </div>
                    </motion.a>
                )}

                {/* Side Bento Column */}
                <div className="md:col-span-4 flex flex-col gap-bento-gap">
                    {sideStories.map((article) => (
                        <motion.a 
                            key={article.id}
                            href={article.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex-1 group relative overflow-hidden rounded-xl bg-surface-container-high bento-card-glow transition-transform duration-500 hover:scale-[1.02]"
                        >
                            <img 
                                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" 
                                src={article.imageUrl || "https://picsum.photos/seed/side/600/400"} 
                                alt={article.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high to-transparent"></div>
                            <div className="absolute bottom-0 p-6">
                                <p className="font-label-caps text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-widest">{article.category}</p>
                                <h2 className="font-headline-md text-lg font-bold text-on-surface line-clamp-2">{article.title}</h2>
                                <p className="font-data-point text-[10px] text-on-surface-variant mt-2 uppercase tracking-wider">
                                    {article.source?.name} • {new Date(article.publishedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} EST
                                </p>
                            </div>
                        </motion.a>
                    ))}
                </div>
            </section>

            {/* Secondary Feed Header */}
            <div className="flex items-center justify-between mb-8 border-b border-outline-variant pb-4">
                <h3 className="font-headline-lg text-2xl font-extrabold text-on-surface tracking-tighter uppercase">Trending Today</h3>
                <div className="flex gap-2">
                    <button 
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full border border-outline-variant hover:bg-white/5 transition-colors"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button 
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full border border-outline-variant hover:bg-white/5 transition-colors"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Content Feed Grid */}
            <div 
                ref={scrollRef}
                className="flex gap-gutter overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 no-scrollbar"
            >
                <AnimatePresence mode="popLayout">
                    {trendingStories.map((article) => (
                        <motion.a 
                            key={article.id}
                            href={article.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex-none w-[calc(100%-16px)] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] snap-start flex flex-col gap-4 group"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-container bento-card-glow">
                                <img 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    src={article.imageUrl || "https://picsum.photos/seed/feed/400/300"} 
                                    alt={article.title}
                                />
                                <div className="absolute top-3 left-3 bg-background/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-on-surface uppercase tracking-widest">
                                    {article.category}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h4 className="font-headline-md text-base font-bold text-on-surface group-hover:text-secondary transition-colors line-clamp-2">
                                    {article.title}
                                </h4>
                                <div className="flex justify-between items-center font-data-point text-[10px] text-on-surface-variant uppercase tracking-wider">
                                    <span>{article.source?.name}</span>
                                    <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                                </div>
                            </div>
                        </motion.a>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
