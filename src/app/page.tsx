"use client";

import NewsFeed from "@/components/NewsFeed";
import IntelligenceMap from "@/components/IntelligenceMap";
import LiveChart from "@/components/LiveChart";
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
  const [mainView, setMainView] = useState<"map" | "chart">("map");
  const [isAnalysisCollapsed, setIsAnalysisCollapsed] = useState<boolean>(false);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<string>("sitrep");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isPausedAudio, setIsPausedAudio] = useState<boolean>(false);

  // Stop speaking when article changes or component unmounts
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    }
  }, [selectedArticle]);

  const handlePlayAudio = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isPlayingAudio) {
      if (isPausedAudio) {
        window.speechSynthesis.resume();
        setIsPausedAudio(false);
      } else {
        window.speechSynthesis.pause();
        setIsPausedAudio(true);
      }
    } else {
      window.speechSynthesis.cancel();
      const textToSpeak = `${selectedArticle.title}. Source: ${selectedArticle.source?.name || "NewsGate System"}. Report contents: ${selectedArticle.content || "No contents available."}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      utterance.onend = () => {
        setIsPlayingAudio(false);
        setIsPausedAudio(false);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setIsPausedAudio(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
      setIsPausedAudio(false);
    }
  };

  const handleStopAudio = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
  };

  // Simple intelligence engine to derive data from article content
  const getArticleAnalysis = (article: any) => {
    if (!article) return null;
    
    const text = (article.title + " " + (article.content || "")).toLowerCase();
    const category = (article.category || "all").toLowerCase();
    
    // Default values
    let volatility = "LOW";
    let tension = "STABLE";
    let bullishScore = 50;
    let retailInterest = "MODERATE";
    let whaleAccumulation = "STEADY";
    let riskDescription = "Standard monitoring protocol active. No immediate outliers detected.";

    // Logic based on category
    if (category === "crypto") {
      volatility = "HIGH";
      bullishScore = text.includes("surge") || text.includes("gain") || text.includes("adopt") || text.includes("etf") ? 85 : 42;
      retailInterest = text.includes("hype") || text.includes("trending") ? "FOMO" : bullishScore > 60 ? "STRONG" : "FEAR";
      whaleAccumulation = text.includes("institution") || text.includes("whale") || text.includes("accumulate") ? "HEAVY" : "STEADY";
    } else if (category === "politics") {
      tension = text.includes("war") || text.includes("conflict") || text.includes("crisis") ? "CRITICAL" : "ELEVATED";
      volatility = tension === "CRITICAL" ? "HIGH" : "MEDIUM";
      bullishScore = tension === "CRITICAL" ? 20 : 45;
      retailInterest = "CAUTIOUS";
      whaleAccumulation = "HEDGING";
    } else if (category === "energy") {
      volatility = text.includes("oil") || text.includes("gas") ? "MEDIUM" : "LOW";
      tension = text.includes("opec") || text.includes("supply") ? "ELEVATED" : "STABLE";
      bullishScore = text.includes("shortage") || text.includes("price hike") ? 70 : 50;
      retailInterest = "MODERATE";
      whaleAccumulation = "POSITIONING";
    }

    // Keyword overrides for extreme Alpha events
    if (text.includes("institutional adoption") || text.includes("major bank") || text.includes("partnership")) {
      whaleAccumulation = "MASSIVE";
      bullishScore = 92;
      retailInterest = "FOMO";
    }

    if (text.includes("hack") || text.includes("exploit") || text.includes("scam")) {
      whaleAccumulation = "EXITING";
      bullishScore = 8;
      retailInterest = "PANIC";
    }

    // Keyword overrides
    if (text.includes("crisis") || text.includes("crash") || text.includes("warning")) {
      volatility = "CRITICAL";
      bullishScore = 15;
      riskDescription = "Emergency risk alerts detected. High probability of systemic impact.";
    }

    return { volatility, tension, bullishScore, retailInterest, whaleAccumulation, riskDescription };
  };

  const analysisData = getArticleAnalysis(selectedArticle);


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
          <div className="h-4 w-[1px] bg-outline-variant/30"></div>
          <div className="flex items-center gap-4">
            <span className="font-label-caps text-[10px] text-on-surface-variant font-bold tracking-widest">DISPLAY VIEW:</span>
            <div className="flex bg-surface-container-high rounded-full p-1 border border-outline-variant/20 shadow-inner">
              <button 
                onClick={() => setMainView("map")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mainView === 'map' ? 'bg-secondary text-on-secondary shadow-[0_0_12px_rgba(180,197,255,0.4)]' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-[16px]">public</span>
                Map
              </button>
              <button 
                onClick={() => setMainView("chart")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mainView === 'chart' ? 'bg-secondary text-on-secondary shadow-[0_0_12px_rgba(180,197,255,0.4)]' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-[16px]">show_chart</span>
                Market
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
        <section className={`col-span-12 lg:col-span-9 grid transition-all duration-500 ease-in-out ${isAnalysisCollapsed ? 'grid-rows-[1fr_48px]' : 'grid-rows-[1.4fr_0.6fr]'} overflow-hidden`}>
        {/* Intelligence Map HUD / Live Chart */}
        <div className="row-span-1 relative group border-b border-outline-variant/20">
          <AnimatePresence mode="wait">
            {mainView === "map" ? (
              <motion.div 
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <IntelligenceMap articleImage={selectedArticle?.imageUrl} />
              </motion.div>
            ) : (
              <motion.div 
                key="chart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <LiveChart />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overlay Corner Accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-secondary/30 pointer-events-none"></div>
        </div>

        {/* Deep Dive Analysis Panel */}
        <div className="row-span-1 bg-surface-container flex flex-col overflow-hidden relative">
            <div className="flex border-b border-outline-variant/20 h-12 items-center px-8 justify-between bg-surface-container-high/50 shrink-0">
              <div className="flex gap-10 h-full">
                <button 
                  onClick={() => setActiveAnalysisTab("sitrep")}
                  className={`font-label-caps text-[10px] h-full flex items-center font-black tracking-widest uppercase transition-all ${activeAnalysisTab === 'sitrep' ? 'text-secondary border-b-2 border-secondary' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Situation Report
                </button>
                <button 
                  onClick={() => setActiveAnalysisTab("risk")}
                  className={`font-label-caps text-[10px] h-full flex items-center font-black tracking-widest uppercase transition-all ${activeAnalysisTab === 'risk' ? 'text-secondary border-b-2 border-secondary' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Risk Assessment
                </button>

              </div>
              <button 
                onClick={() => setIsAnalysisCollapsed(!isAnalysisCollapsed)}
                className="w-8 h-8 flex items-center justify-center hover:bg-surface-variant/20 rounded-lg transition-all group"
                title={isAnalysisCollapsed ? "Expand Analysis" : "Collapse Analysis"}
              >
                <span className={`material-symbols-outlined text-[20px] text-outline group-hover:text-secondary transition-transform duration-500 ${isAnalysisCollapsed ? 'rotate-180' : ''}`}>
                  keyboard_arrow_down
                </span>
              </button>
            </div>
            
            <div className="flex-1 p-8 grid grid-cols-12 gap-10 overflow-y-auto no-scrollbar">
              <AnimatePresence mode="wait">
                {selectedArticle ? (
                  <motion.div 
                    key={`${selectedArticle.id}-${activeAnalysisTab}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="col-span-12 grid grid-cols-12 gap-10"
                  >
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                      {activeAnalysisTab === "sitrep" && (
                        <>
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-outline-variant/30 shadow-2xl relative group">
                              <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={selectedArticle.imageUrl || "https://picsum.photos/seed/analysis/400/400"} alt="Analysis" />
                              <div className="absolute inset-0 bg-secondary/10"></div>
                            </div>
                            <div className="flex flex-col">
                              <h4 className="font-headline-sm text-xl font-black text-on-surface tracking-tight line-clamp-2">
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
                              <p className="mb-6 italic">No SITREP data available for this intelligence node.</p>
                            )}
                            <div className="flex items-center flex-wrap gap-6 border-t border-outline-variant/10 pt-6">
                              <a href={selectedArticle.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                                View Full Report <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                              </a>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedArticle.sourceUrl || "");
                                  setIsCopied(true);
                                  setTimeout(() => setIsCopied(false), 2000);
                                }}
                                className={`${isCopied ? 'text-green-400' : 'text-on-surface-variant hover:text-secondary'} font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-colors`}
                              >
                                {isCopied ? "Link Copied" : "Copy Intel Link"} <span className="material-symbols-outlined text-[16px]">{isCopied ? "check" : "content_copy"}</span>
                              </button>

                              <div className="h-4 w-[1px] bg-outline-variant/30 hidden md:block"></div>

                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={handlePlayAudio}
                                  className={`${isPlayingAudio && !isPausedAudio ? 'text-secondary font-black' : 'text-on-surface-variant hover:text-secondary'} font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95`}
                                >
                                  {isPlayingAudio && !isPausedAudio ? (
                                    <>
                                      <span>Briefing Active</span>
                                      {/* Animated audio wave bars */}
                                      <div className="flex items-end gap-[3px] h-3.5 w-6">
                                        <span className="w-[3px] bg-secondary rounded-full animate-pulse h-full"></span>
                                        <span className="w-[3px] bg-secondary rounded-full animate-pulse h-2.5" style={{ animationDelay: '0.15s' }}></span>
                                        <span className="w-[3px] bg-secondary rounded-full animate-pulse h-4" style={{ animationDelay: '0.3s' }}></span>
                                        <span className="w-[3px] bg-secondary rounded-full animate-pulse h-2" style={{ animationDelay: '0.45s' }}></span>
                                      </div>
                                    </>
                                  ) : isPausedAudio ? (
                                    <>Resume Briefing <span className="material-symbols-outlined text-[18px]">play_arrow</span></>
                                  ) : (
                                    <>Listen Briefing <span className="material-symbols-outlined text-[18px]">volume_up</span></>
                                  )}
                                </button>
                                
                                {isPlayingAudio && (
                                  <button 
                                    onClick={handleStopAudio}
                                    className="text-error hover:text-error/80 font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-colors active:scale-95"
                                    title="Stop Briefing"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">stop</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {activeAnalysisTab === "risk" && analysisData && (
                        <div className="space-y-6">
                          <h4 className="font-headline-sm text-xl font-black text-on-surface tracking-tight uppercase">Intelligence Risk Assessment</h4>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="p-5 bg-surface-variant/20 rounded-2xl border border-outline-variant/20">
                              <p className="font-label-caps text-[10px] text-outline mb-2 uppercase font-black">Volatility Impact</p>
                              <p className={`text-2xl font-black ${analysisData.volatility === 'CRITICAL' ? 'text-error' : analysisData.volatility === 'HIGH' ? 'text-secondary' : 'text-on-surface'}`}>{analysisData.volatility}</p>
                              <p className="text-[11px] text-on-surface-variant mt-2">Expected movement based on {selectedArticle.category} sector volatility.</p>
                            </div>
                            <div className="p-5 bg-surface-variant/20 rounded-2xl border border-outline-variant/20">
                              <p className="font-label-caps text-[10px] text-outline mb-2 uppercase font-black">Geopolitical Tension</p>
                              <p className={`text-2xl font-black ${analysisData.tension === 'CRITICAL' ? 'text-error' : analysisData.tension === 'ELEVATED' ? 'text-secondary' : 'text-on-surface'}`}>{analysisData.tension}</p>
                              <p className="text-[11px] text-on-surface-variant mt-2">Regional stability index for current intelligence node.</p>
                            </div>
                          </div>
                          <div className="p-6 bg-surface-container-high/40 rounded-2xl border border-outline-variant/10">
                            <p className="text-sm text-on-surface leading-relaxed">{analysisData.riskDescription}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="col-span-12 lg:col-span-4 space-y-6">
                      {/* Sentiment & Flow Indicators */}
                      {analysisData && (
                        <div className="bg-surface-container-high/60 backdrop-blur-md rounded-2xl p-6 border border-outline-variant/20 shadow-xl space-y-5">
                          <h6 className="font-label-caps text-[10px] text-outline uppercase tracking-[0.2em] font-black">Market Sentiment & Flows</h6>
                          
                          {/* Sentiment Meter */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-medium text-on-surface-variant">Bullish Sentiment</span>
                              <span className="font-black font-data-point text-secondary">{analysisData.bullishScore}%</span>
                            </div>
                            <div className="h-2 w-full bg-surface-variant/40 rounded-full overflow-hidden border border-outline-variant/10 relative">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full shadow-[0_0_8px_rgba(180,197,255,0.4)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${analysisData.bullishScore}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              />
                            </div>
                            <div className="flex justify-between text-[9px] font-label-caps text-outline">
                              <span>BEARISH</span>
                              <span>NEUTRAL</span>
                              <span>BULLISH</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-outline-variant/10">
                            <div className="space-y-1">
                              <span className="font-label-caps text-[9px] text-outline block uppercase tracking-wider">Whale Action</span>
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black border uppercase tracking-wider ${
                                analysisData.whaleAccumulation === 'MASSIVE' || analysisData.whaleAccumulation === 'HEAVY' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)] animate-pulse' 
                                  : analysisData.whaleAccumulation === 'EXITING'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)] animate-pulse'
                                  : 'bg-surface-variant/40 text-on-surface-variant border-outline-variant/20'
                              }`}>
                                {analysisData.whaleAccumulation}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <span className="font-label-caps text-[9px] text-outline block uppercase tracking-wider">Retail Bias</span>
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black border uppercase tracking-wider ${
                                analysisData.retailInterest === 'FOMO' || analysisData.retailInterest === 'STRONG'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                                  : analysisData.retailInterest === 'PANIC' || analysisData.retailInterest === 'FEAR'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                                  : 'bg-surface-variant/40 text-on-surface-variant border-outline-variant/20'
                              }`}>
                                {analysisData.retailInterest}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

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
