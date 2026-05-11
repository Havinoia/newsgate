"use client";

import NewsFeed from "@/components/NewsFeed";
import IntelligenceMap from "@/components/IntelligenceMap";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "all";
  const q = searchParams.get("q") || "";
  
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [sortBy, setSortBy] = useState<string>("latest");


  // Reset selection when category changes
  useEffect(() => {
    setSelectedArticle(null);
  }, [category, q]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Intelligence Ribbon (Signal vs Noise) */}
      <section className="h-14 flex items-center px-6 bg-surface-container-lowest border-b border-outline-variant/10 justify-between shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_rgba(180,197,255,0.8)]"></div>
            <span className="font-label-caps text-[10px] text-secondary uppercase tracking-[0.2em] font-black">Live Signal</span>
          </div>
          <div className="h-4 w-[1px] bg-outline-variant/30"></div>
          <div className="flex items-center gap-4">
            <span className="font-label-caps text-[10px] text-on-surface-variant font-bold tracking-widest">SORT INTELLIGENCE:</span>
            <div className="flex bg-surface-container-high rounded-full p-1 border border-outline-variant/20 shadow-inner">
              <button 
                onClick={() => setSortBy("impact")}
                className={`px-4 py-1.5 text-[10px] rounded-full font-black tracking-wider uppercase transition-all duration-300 ${sortBy === 'impact' ? 'bg-secondary text-on-secondary shadow-[0_0_12px_rgba(180,197,255,0.4)]' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                High Impact
              </button>
              <button 
                onClick={() => setSortBy("latest")}
                className={`px-4 py-1.5 text-[10px] rounded-full font-black tracking-wider uppercase transition-all duration-300 ${sortBy === 'latest' ? 'bg-secondary text-on-secondary shadow-[0_0_12px_rgba(180,197,255,0.4)]' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Latest
              </button>
              <button 
                onClick={() => setSortBy("oldest")}
                className={`px-4 py-1.5 text-[10px] rounded-full font-black tracking-wider uppercase transition-all duration-300 ${sortBy === 'oldest' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Oldest
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-[11px] font-data-point">
            <span className="text-outline uppercase tracking-wider">Volatility:</span>
            <span className="text-error font-black">18.2%</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-data-point">
            <span className="text-outline uppercase tracking-wider">Sentiment:</span>
            <span className="text-secondary font-black">+0.64</span>
          </div>
        </div>
      </section>

      {/* Command Center Grid */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Side: Intelligence Stream */}
        <section className="col-span-12 lg:col-span-3 border-r border-outline-variant/20 flex flex-col bg-surface-container-low/30 backdrop-blur-md overflow-hidden">
          <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
            <h3 className="font-headline-md text-sm text-on-surface uppercase tracking-[0.1em] font-black">Intelligence Stream</h3>
            <span className="material-symbols-outlined text-outline text-[18px]">filter_list</span>
          </div>
          <Suspense fallback={<div className="p-8 text-center animate-pulse text-outline font-label-caps text-[10px]">Syncing with global nodes...</div>}>
            <NewsFeed 
              initialCategory={category} 
              initialSearch={q} 
              sortBy={sortBy}
              onSelectArticle={setSelectedArticle} 
              selectedArticleId={selectedArticle?.id} 
            />
          </Suspense>
        </section>

        {/* Main Command Display */}
        <section className="col-span-12 lg:col-span-9 grid grid-rows-[1.4fr_0.6fr] overflow-hidden">
        {/* Intelligence Map HUD */}
        <div className="row-span-1 relative group border-b border-outline-variant/20">
          <IntelligenceMap />
          {/* Overlay Corner Accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-secondary/30 pointer-events-none"></div>
        </div>

        {/* Deep Dive Analysis Panel */}
        <div className="row-span-1 bg-surface-container flex flex-col overflow-hidden relative">
            <div className="flex border-b border-outline-variant/20 h-12 items-center px-8 gap-10 bg-surface-container-high/50 shrink-0">
              <button className="font-label-caps text-[10px] text-secondary border-b-2 border-secondary h-full flex items-center font-black tracking-widest uppercase">Deep Dive Analysis</button>
              <button className="font-label-caps text-[10px] text-on-surface-variant hover:text-on-surface transition-colors h-full flex items-center font-black tracking-widest uppercase">Correlated Events</button>
              <button className="font-label-caps text-[10px] text-on-surface-variant hover:text-on-surface transition-colors h-full flex items-center font-black tracking-widest uppercase">Social Sentiment</button>
            </div>
            
            <div className="flex-1 p-8 grid grid-cols-12 gap-10 overflow-y-auto no-scrollbar">
              <AnimatePresence mode="wait">
                {selectedArticle ? (
                  <motion.div 
                    key={selectedArticle.id}
                    initial={{ opacity: 0, y: 10, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.99 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="col-span-12 grid grid-cols-12 gap-10"
                  >
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-outline-variant/30 shadow-2xl relative group">
                        <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={selectedArticle.imageUrl || "https://picsum.photos/seed/analysis/400/400"} alt="Analysis" />
                        <div className="absolute inset-0 bg-secondary/10"></div>
                      </div>
                            <div className="flex flex-col">
                              <h4 className="font-headline-sm text-xl font-black text-on-surface tracking-tight group-hover:text-secondary transition-colors line-clamp-2">
                                {selectedArticle.title}
                              </h4>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[10px] font-black text-secondary tracking-[0.1em] uppercase">
                                  Source {selectedArticle.source?.name || "NewsGate System"}
                                </span>
                                <span className="w-1 h-1 bg-outline-variant/50 rounded-full"></span>
                                <span className="text-[10px] font-bold text-outline tracking-wider flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                  {new Date(selectedArticle.publishedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} | {new Date(selectedArticle.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                                </span>
                              </div>
                            </div>
                    </div>
                    
                    <div className="prose prose-invert max-w-none text-on-surface-variant leading-relaxed font-body-lg text-lg">
                      {selectedArticle.content ? (
                        <p className="mb-6">{selectedArticle.content}</p>
                      ) : (
                        <p className="mb-6 italic">No deep dive analysis available for this intelligence report. Please refer to the source URL for full coverage.</p>
                      )}
                      <a href={selectedArticle.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                        View Full Report <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      </a>
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-surface-container-high/60 backdrop-blur-md rounded-2xl p-6 border border-outline-variant/20 shadow-xl">
                      <h6 className="font-label-caps text-[10px] text-outline mb-4 uppercase tracking-[0.2em] font-black">Related Entities</h6>
                      <div className="flex flex-wrap gap-2">
                        {[selectedArticle.category, selectedArticle.source?.name, "GLOBAL INTEL"].map(entity => (
                          <span key={entity} className="px-3 py-1.5 bg-surface-variant/40 text-[9px] font-black rounded-lg border border-outline-variant/20 hover:border-secondary/40 hover:bg-secondary/10 transition-all cursor-default uppercase tracking-wider">
                            {entity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-12 flex flex-col items-center justify-center text-on-surface-variant opacity-50 space-y-4 py-20"
                  >
                    <span className="material-symbols-outlined text-[48px]">analytics</span>
                    <p className="font-label-caps text-xs tracking-widest uppercase">Select an intelligence stream to begin deep dive analysis</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
