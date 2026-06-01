"use client";
 
import NewsFeed from "@/components/NewsFeed";
import IntelligenceMap from "@/components/IntelligenceMap";
import LiveChart from "@/components/LiveChart";
import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
 
interface Article {
  id: string | number;
  title: string;
  content: string;
  category: string;
  publishedAt: string;
  imageUrl?: string;
  sourceUrl?: string;
  source?: {
    name: string;
  };
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // States
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [sortBy, setSortBy] = useState<string>("latest");
  const [mainView, setMainView] = useState<"map" | "chart">("map");
  const [isAnalysisCollapsed, setIsAnalysisCollapsed] = useState<boolean>(false);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<string>("sitrep");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  
  // TTS Audio Console States
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isPausedAudio, setIsPausedAudio] = useState<boolean>(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1);
  const [audioVoice, setAudioVoice] = useState<"male" | "female">("female");
  
  // AI Analyst Terminal States
  const [activeAnalyst, setActiveAnalyst] = useState<"macro" | "geo" | "whale">("macro");
  const [terminalOutput, setTerminalOutput] = useState<string>("Awaiting command payload initialization...");
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [customQuery, setCustomQuery] = useState<string>("");

  // Sync category and search query from URL params initially
  useEffect(() => {
    const cat = searchParams.get("category") || "all";
    const q = searchParams.get("q") || "";
    setActiveCategory(cat);
    setSearchQuery(q);
  }, [searchParams]);

  // Clean TTS speaking when article changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    }
  }, [selectedArticle]);

  // TTS speaking controllers
  const handlePlayAudio = () => {
    if (typeof window === "undefined" || !window.speechSynthesis || !selectedArticle) return;

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
      
      // Apply speeds and custom tones
      utterance.rate = audioSpeed;
      utterance.pitch = audioVoice === "male" ? 0.85 : 1.18;
      
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

  // Simulated AI synthesis response triggers
  const executeAICommand = (commandType: "correlations" | "risk" | "flows" | "custom") => {
    if (!selectedArticle) {
      setTerminalOutput("ERROR: No active intelligence node selected. Sync node stream first.");
      return;
    }
    
    setIsSynthesizing(true);
    setTerminalOutput("Initializing target synthesis engine... compiling vectors...");
 
    const title = selectedArticle.title;
    const cat = (selectedArticle.category || "all").toUpperCase();
    let textResult = "";
 
    if (commandType === "custom") {
      const queryText = customQuery.trim() || "GENERAL CORRELATION SHIFT PROTOCOL";
      textResult = `[CUSTOM QUERY ANALYSIS] Processing query "${queryText.toUpperCase()}" against node [${title}]. Vector mapping confirms heavy systemic correlation in ${cat} sector. Risk thresholds remain within volatile margins. Synthesis: structural positions recommended.`;
      setCustomQuery("");
    } else {
      const responses = {
        macro: {
          correlations: `[MACRO STRATEGIST] Analyzing correlations for node [${title}]. Sector: ${cat}. Bond yields (US10Y) show immediate correlation shifts at +4.5bps. Correlated assets: SPY index shows -0.24 volatility correlation. High probability of central bank hedging flows detected in local indices.`,
          risk: `[MACRO STRATEGIST] Risk fallout vector initialized. Volatility spikes to 18.2% across associated asset clusters. Macro liquidity thresholds indicate capital outflows toward defensive hedging structures. Inflation risk factor: ELEVATED.`,
          flows: `[MACRO STRATEGIST] Capital flow synthesis: Heavy sovereign accumulation detected in local treasury bills. Currency matrix shifts show direct inflows into USD indices (+0.14%). Recommended action: Hedging posture on growth-correlated indices.`
        },
        geo: {
          correlations: `[GEOPOLITICAL SPECIALIST] Spatial mapping correlations active. Node: [${title}]. Sector: ${cat}. Correlation coefficient high along trade shipping corridors (+0.82). Supply chain vulnerability indexes rise in maritime zones.`,
          risk: `[GEOPOLITICAL SPECIALIST] Geopolitical fallout assessment: Localized borders show immediate high-tension vectors. Strategic reserves are being positioned in response to trade routes disruption. 78% trade risk alert verified.`,
          flows: `[GEOPOLITICAL SPECIALIST] Geopolitical flow vector: Supply flows shift from maritime corridors to trans-continental rail channels. Inflows into regional safe-havens increased by 3.5M daily average volume.`
        },
        whale: {
          correlations: `[WHALE TRACKER] Blockchain & off-book block order correlations syncing. Node: [${title}]. Sector: ${cat}. Major wallet clusters (sizes > 10,000 ETH/1,000 BTC) show high correlation index to immediate news flash (+0.75).`,
          risk: `[WHALE TRACKER] Whale liquidation risk: Heavy hedging detected. Sell-side liquidity index rises in derivative order books. Volatility risk: HIGH. Large liquidity pools are shifting to cold storage clusters.`,
          flows: `[WHALE TRACKER] Large block flow synthesis: Cumulative volume delta (CVD) shows strong buying absorption by institutional desks. Over $45M USD converted into strategic assets in sub-second execution windows.`
        }
      };
      textResult = responses[activeAnalyst][commandType];
    }

    // Typewriter typewriter simulation
    setTimeout(() => {
      setTerminalOutput(textResult);
      setIsSynthesizing(false);
    }, 1200);
  };

  const getArticleAnalysis = (article: Article | null) => {
    if (!article) return null;
    const text = (article.title + " " + (article.content || "")).toLowerCase();
    const category = (article.category || "all").toLowerCase();
    
    let volatility = "LOW";
    let tension = "STABLE";
    let bullishScore = 50;
    let retailInterest = "MODERATE";
    let whaleAccumulation = "STEADY";
    let riskDescription = "Standard monitoring protocol active. No immediate outliers detected.";

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

    if (text.includes("crisis") || text.includes("crash") || text.includes("warning")) {
      volatility = "CRITICAL";
      bullishScore = 15;
      riskDescription = "Emergency risk alerts detected. High probability of systemic impact.";
    }

    return { volatility, tension, bullishScore, retailInterest, whaleAccumulation, riskDescription };
  };

  const analysisData = getArticleAnalysis(selectedArticle);

  const selectCategory = (category: string) => {
    setActiveCategory(category);
    setSelectedArticle(null);
    router.push(`/?category=${category}`);
  };

  // Heatmap static parameters
  const sectors = [
    { name: "Crypto Asset Matrix", score: 75, status: "BULLISH", color: "text-secondary border-secondary/30 bg-secondary/5", slug: "crypto" },
    { name: "Geopolitical Vectors", score: 28, status: "CRITICAL", color: "text-error border-error/30 bg-error/5", slug: "politics" },
    { name: "Energy Reserves Corridor", score: 62, status: "ELEVATED", color: "text-tertiary border-tertiary/30 bg-tertiary/5", slug: "energy" },
    { name: "Macro Liquidity Tickers", score: 50, status: "STABLE", color: "text-outline border-outline/30 bg-surface-container-high/20", slug: "all" },
  ];

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
            <span className="text-error font-black text-glow" style={{ color: "var(--color-error)" }}>18.2%</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-data-point">
            <span className="text-outline uppercase tracking-wider">Sentiment:</span>
            <span className="text-secondary font-black text-glow" style={{ color: "var(--color-secondary)" }}>+0.64</span>
          </div>
        </div>
      </section>
 
      {/* Command Center Grid */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Side: Intelligence Stream */}
        <section className="col-span-12 lg:col-span-3 border-r border-outline-variant/20 flex flex-col bg-surface-container-low/20 backdrop-blur-md overflow-hidden">
          <Suspense fallback={<div className="p-8 text-center animate-pulse text-outline font-label-caps text-[10px]">Syncing with global nodes...</div>}>
            <NewsFeed 
              initialCategory={activeCategory} 
              initialSearch={searchQuery} 
              sortBy={sortBy}
              onSelectArticle={setSelectedArticle} 
              selectedArticleId={selectedArticle?.id} 
            />
          </Suspense>
        </section>
 
        {/* Main Command Display */}
        <section className={`col-span-12 lg:col-span-9 grid transition-all duration-500 ease-in-out ${isAnalysisCollapsed ? 'grid-rows-[1fr_48px]' : 'grid-rows-[1.2fr_0.8fr]'} overflow-hidden`}>
          {/* Intelligence Map HUD / Live Chart */}
          <div className="row-span-1 relative group border-b border-outline-variant/20 p-2">
            <AnimatePresence mode="wait">
              {mainView === "map" ? (
                <motion.div 
                  key="map"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  <IntelligenceMap 
                    articleImage={selectedArticle?.imageUrl} 
                    activeCategory={activeCategory}
                    onSelectCategory={selectCategory}
                  />
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
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-secondary/35 pointer-events-none"></div>
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-secondary/35 pointer-events-none"></div>
          </div>
 
          {/* Deep Dive Bento Panel (Double Height tabs / Multi layout widgets) */}
          <div className="row-span-1 bg-surface-container/30 flex flex-col overflow-hidden relative">
            <div className="flex border-b border-outline-variant/20 h-12 items-center px-6 justify-between bg-surface-container-high/40 shrink-0">
              <div className="flex gap-8 h-full">
                <button 
                  onClick={() => setActiveAnalysisTab("sitrep")}
                  className={`font-label-caps text-[10px] h-full flex items-center font-black tracking-widest uppercase transition-all ${activeAnalysisTab === 'sitrep' ? 'text-secondary border-b-2 border-secondary text-glow' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Situation Report
                </button>
                <button 
                  onClick={() => setActiveAnalysisTab("risk")}
                  className={`font-label-caps text-[10px] h-full flex items-center font-black tracking-widest uppercase transition-all ${activeAnalysisTab === 'risk' ? 'text-secondary border-b-2 border-secondary text-glow' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Risk Assessment
                </button>
                <button 
                  onClick={() => setActiveAnalysisTab("heatmap")}
                  className={`font-label-caps text-[10px] h-full flex items-center font-black tracking-widest uppercase transition-all ${activeAnalysisTab === 'heatmap' ? 'text-secondary border-b-2 border-secondary text-glow' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Market Heatmap
                </button>
                <button 
                  onClick={() => setActiveAnalysisTab("ai_analyst")}
                  className={`font-label-caps text-[10px] h-full flex items-center font-black tracking-widest uppercase transition-all ${activeAnalysisTab === 'ai_analyst' ? 'text-secondary border-b-2 border-secondary text-glow' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  AI Intelligence Desk
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
            
            <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
              <AnimatePresence mode="wait">
                {selectedArticle ? (
                  <motion.div 
                    key={`${selectedArticle.id}-${activeAnalysisTab}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {/* tab 1: situation report with audio briefing dashboard */}
                    {activeAnalysisTab === "sitrep" && (
                      <div className="grid grid-cols-12 gap-6 items-start">
                        <div className="col-span-12 lg:col-span-8 space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-outline-variant/30 shadow-2xl relative shrink-0 group">
                              <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={selectedArticle.imageUrl || "https://picsum.photos/seed/analysis/400/400"} alt="Analysis" />
                              <div className="absolute inset-0 bg-secondary/10"></div>
                            </div>
                            <div className="flex flex-col">
                              <h4 className="font-headline-sm text-lg font-black text-on-surface tracking-tight line-clamp-2">
                                {selectedArticle.title}
                              </h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-black text-secondary tracking-[0.1em] uppercase">
                                  Source: {selectedArticle.source?.name || "NewsGate System"}
                                </span>
                                <span className="w-1 h-1 bg-outline-variant/50 rounded-full"></span>
                                <span className="text-[10px] font-bold text-outline tracking-wider flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                                  {new Date(selectedArticle.publishedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} | {new Date(selectedArticle.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="prose prose-invert max-w-none text-on-surface-variant leading-relaxed font-body-md text-base bg-surface-container-low/20 p-4 rounded-xl border border-outline-variant/10">
                            {selectedArticle.content ? (
                              <p className="mb-4">{selectedArticle.content}</p>
                            ) : (
                              <p className="mb-4 italic">No SITREP data available for this intelligence node.</p>
                            )}
                            <div className="flex items-center flex-wrap gap-4 border-t border-outline-variant/10 pt-4 text-xs font-bold">
                              <a href={selectedArticle.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline font-black uppercase tracking-widest flex items-center gap-1.5">
                                View Full Report <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                              </a>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedArticle.sourceUrl || "");
                                  setIsCopied(true);
                                  setTimeout(() => setIsCopied(false), 2000);
                                }}
                                className={`${isCopied ? 'text-green-400' : 'text-on-surface-variant hover:text-secondary'} uppercase tracking-widest flex items-center gap-1.5 transition-colors`}
                              >
                                {isCopied ? "Link Copied" : "Copy Intel Link"} <span className="material-symbols-outlined text-[14px]">{isCopied ? "check" : "content_copy"}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Premium Audio Briefing Player Card */}
                        <div className="col-span-12 lg:col-span-4 bg-surface-container-high/40 rounded-2xl p-5 border border-outline-variant/15 shadow-xl space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
                            <span className="font-label-caps text-[9px] text-outline uppercase tracking-[0.2em] font-black">TACTICAL TTS CONSOLE</span>
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                              <span className="text-[8px] font-label-caps font-bold text-secondary">ACTIVE DECK</span>
                            </div>
                          </div>

                          {/* Dynamic Audio wave SVG visualizer */}
                          <div className="h-12 bg-background/60 rounded-xl border border-outline-variant/15 flex items-center justify-center gap-1 px-4 relative overflow-hidden">
                            {/* Inactive background wave overlay */}
                            <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-10">
                              {[...Array(16)].map((_, i) => (
                                <div key={i} className="w-[3px] bg-secondary rounded-full h-8" />
                              ))}
                            </div>
                            
                            {/* Speaking active wave */}
                            {isPlayingAudio && !isPausedAudio ? (
                              <div className="flex items-center justify-center gap-1.5 h-8 z-10">
                                <div className="w-[3px] bg-secondary rounded-full animate-wave-1" style={{ animationDuration: `${0.8 / audioSpeed}s` }} />
                                <div className="w-[3px] bg-secondary rounded-full animate-wave-2" style={{ animationDuration: `${0.6 / audioSpeed}s` }} />
                                <div className="w-[3px] bg-secondary rounded-full animate-wave-3" style={{ animationDuration: `${0.7 / audioSpeed}s` }} />
                                <div className="w-[3px] bg-secondary rounded-full animate-wave-4" style={{ animationDuration: `${0.9 / audioSpeed}s` }} />
                                <div className="w-[3px] bg-secondary rounded-full animate-wave-2" style={{ animationDuration: `${0.55 / audioSpeed}s` }} />
                                <div className="w-[3px] bg-secondary rounded-full animate-wave-3" style={{ animationDuration: `${0.75 / audioSpeed}s` }} />
                                <div className="w-[3px] bg-secondary rounded-full animate-wave-1" style={{ animationDuration: `${0.85 / audioSpeed}s` }} />
                              </div>
                            ) : (
                              <span className="text-[10px] font-label-caps text-outline uppercase tracking-wider z-10">
                                {isPausedAudio ? "Briefing Paused" : "Synthesizer Idle"}
                              </span>
                            )}
                          </div>

                          {/* Voice Configuration controls */}
                          <div className="grid grid-cols-2 gap-3 text-[10px] font-label-caps">
                            <div className="space-y-1">
                              <span className="text-[8px] text-outline uppercase block tracking-wider">Voice Character</span>
                              <div className="flex border border-outline-variant/20 rounded-lg p-0.5 bg-background/40">
                                <button 
                                  onClick={() => setAudioVoice("female")}
                                  className={`flex-1 py-1 rounded text-center font-bold transition-all ${audioVoice === 'female' ? 'bg-secondary text-on-secondary shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
                                >
                                  Female
                                </button>
                                <button 
                                  onClick={() => setAudioVoice("male")}
                                  className={`flex-1 py-1 rounded text-center font-bold transition-all ${audioVoice === 'male' ? 'bg-secondary text-on-secondary shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
                                >
                                  Male
                                </button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[8px] text-outline uppercase block tracking-wider">Speed Mult.</span>
                              <div className="flex border border-outline-variant/20 rounded-lg p-0.5 bg-background/40">
                                {[1, 1.5, 2].map((s) => (
                                  <button 
                                    key={s}
                                    onClick={() => setAudioSpeed(s)}
                                    className={`flex-1 py-1 rounded text-center font-black transition-all ${audioSpeed === s ? 'bg-secondary text-on-secondary shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
                                  >
                                    {s}x
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Primary Speak player commands */}
                          <div className="flex gap-2">
                            <button 
                              onClick={handlePlayAudio}
                              className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-secondary/20 ${
                                isPlayingAudio && !isPausedAudio 
                                  ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' 
                                  : 'bg-secondary text-on-secondary hover:bg-secondary/90 shadow-[0_0_12px_rgba(180,197,255,0.3)]'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {isPlayingAudio && !isPausedAudio ? "pause" : "play_arrow"}
                              </span>
                              {isPlayingAudio && !isPausedAudio ? "Pause" : isPausedAudio ? "Resume" : "Synthesize"}
                            </button>
                            {isPlayingAudio && (
                              <button 
                                onClick={handleStopAudio}
                                className="px-4 py-2.5 rounded-xl bg-error/10 text-error border border-error/20 hover:bg-error/20 transition-all active:scale-95"
                                title="Terminate Speech"
                              >
                                <span className="material-symbols-outlined text-[18px] block">stop</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
 
                    {/* tab 2: risk assessment info */}
                    {activeAnalysisTab === "risk" && analysisData && (
                      <div className="space-y-6 max-w-4xl">
                        <h4 className="font-headline-sm text-lg font-black text-on-surface tracking-tight uppercase border-b border-outline-variant/10 pb-2">Geopolitical Risk Vector Assessment</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-surface-container-high/40 rounded-xl border border-outline-variant/15 flex flex-col justify-between">
                            <div>
                              <p className="font-label-caps text-[9px] text-outline mb-1 uppercase font-black">VOLATILITY COEFFICIENT</p>
                              <p className={`text-xl font-black text-glow ${analysisData.volatility === 'CRITICAL' ? 'text-error' : analysisData.volatility === 'HIGH' ? 'text-secondary' : 'text-on-surface'}`}>{analysisData.volatility}</p>
                            </div>
                            <p className="text-[10px] text-on-surface-variant mt-2 font-medium">Standard structural index variations mapped across associated global currency exchanges.</p>
                          </div>
                          
                          <div className="p-4 bg-surface-container-high/40 rounded-xl border border-outline-variant/15 flex flex-col justify-between">
                            <div>
                              <p className="font-label-caps text-[9px] text-outline mb-1 uppercase font-black">GEOPOLITICAL TENSION INDEX</p>
                              <p className={`text-xl font-black text-glow ${analysisData.tension === 'CRITICAL' ? 'text-error' : analysisData.tension === 'ELEVATED' ? 'text-secondary' : 'text-on-surface'}`}>{analysisData.tension}</p>
                            </div>
                            <p className="text-[10px] text-on-surface-variant mt-2 font-medium">Border friction and supply disruption index calculated at geographic nodes.</p>
                          </div>

                          <div className="p-4 bg-surface-container-high/40 rounded-xl border border-outline-variant/15 flex flex-col justify-between">
                            <div>
                              <p className="font-label-caps text-[9px] text-outline mb-1 uppercase font-black">SYSTEM FALLOUT METRIC</p>
                              <p className="text-xl font-black text-secondary text-glow" style={{ color: "var(--color-secondary)" }}>ELEVATED</p>
                            </div>
                            <p className="text-[10px] text-on-surface-variant mt-2 font-medium">Calculated systemic danger mapping. Spillover likelihood to secondary classes: 32%.</p>
                          </div>
                        </div>

                        <div className="p-5 bg-surface-container-low/40 rounded-xl border border-outline-variant/10 text-sm leading-relaxed text-on-surface-variant">
                          <p className="font-bold text-on-surface mb-2 uppercase text-xs flex items-center gap-1.5 text-glow" style={{ color: "var(--color-secondary)" }}>
                            <span className="material-symbols-outlined text-[16px]">shield_alert</span>
                            Analyst Synthesis Report
                          </p>
                          {analysisData.riskDescription}
                        </div>
                      </div>
                    )}

                    {/* tab 3: interactive market heatmap matrix */}
                    {activeAnalysisTab === "heatmap" && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                          <h4 className="font-headline-sm text-lg font-black text-on-surface tracking-tight uppercase">Market Volatility Heatmap</h4>
                          <span className="font-label-caps text-[8px] text-outline uppercase font-bold">CLICK SQUARE TO FILTER TACTICAL NEWSFEED STREAM</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {sectors.map((sec) => {
                            const isSelected = activeCategory === sec.slug;
                            return (
                              <button 
                                key={sec.slug}
                                onClick={() => selectCategory(sec.slug)}
                                className={`text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] ${sec.color} ${
                                  isSelected ? 'ring-2 ring-secondary shadow-2xl' : 'hover:border-outline-variant/50'
                                }`}
                              >
                                {/* Static lines overlay inside boxes */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-10 pointer-events-none" />
                                
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                  <span className="font-label-caps text-[10px] font-black uppercase tracking-wider block max-w-[80%] leading-tight">
                                    {sec.name}
                                  </span>
                                  <span className="material-symbols-outlined text-[18px] opacity-40 group-hover:opacity-100 transition-opacity">
                                    {sec.slug === 'crypto' ? 'currency_bitcoin' : sec.slug === 'politics' ? 'gavel' : sec.slug === 'energy' ? 'local_fire_department' : 'widgets'}
                                  </span>
                                </div>

                                <div className="flex justify-between items-end mt-4 relative z-10">
                                  <div className="flex flex-col">
                                    <span className="text-3xl font-black tracking-tighter block">{sec.score}%</span>
                                    <span className="text-[9px] font-label-caps font-bold opacity-60">STABILITY INDEX</span>
                                  </div>
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white/10 uppercase tracking-widest">
                                    {sec.status}
                                  </span>
                                </div>

                                {/* Active glowing highlight dot */}
                                {isSelected && (
                                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-secondary animate-ping" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* tab 4: interactive AI strategist terminal panel */}
                    {activeAnalysisTab === "ai_analyst" && (
                      <div className="grid grid-cols-12 gap-6 h-full items-start">
                        {/* Analyst persona sidebar selectors */}
                        <div className="col-span-12 lg:col-span-3 flex flex-col gap-2">
                          <span className="font-label-caps text-[9px] text-outline font-black uppercase tracking-widest pb-1 border-b border-outline-variant/10 mb-1">AI Intel Desk</span>
                          
                          <button 
                            onClick={() => setActiveAnalyst("macro")}
                            className={`p-3.5 rounded-xl border text-left transition-all relative ${
                              activeAnalyst === 'macro' 
                                ? 'bg-secondary-container/10 border-secondary text-secondary font-black shadow-lg shadow-black/20' 
                                : 'bg-surface-container-high/20 border-outline-variant/15 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/35'
                            }`}
                          >
                            <span className="text-[11px] font-black block uppercase tracking-wide">Macro Strategist</span>
                            <span className="text-[8px] font-label-caps opacity-60 block mt-1">Sovereign Bonds & Central Banks</span>
                            {activeAnalyst === 'macro' && <div className="absolute right-3 top-4 w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />}
                          </button>

                          <button 
                            onClick={() => setActiveAnalyst("geo")}
                            className={`p-3.5 rounded-xl border text-left transition-all relative ${
                              activeAnalyst === 'geo' 
                                ? 'bg-secondary-container/10 border-secondary text-secondary font-black shadow-lg shadow-black/20' 
                                : 'bg-surface-container-high/20 border-outline-variant/15 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/35'
                            }`}
                          >
                            <span className="text-[11px] font-black block uppercase tracking-wide">Geopolitical Specialist</span>
                            <span className="text-[8px] font-label-caps opacity-60 block mt-1">Borders, Routes & Supply Risks</span>
                            {activeAnalyst === 'geo' && <div className="absolute right-3 top-4 w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />}
                          </button>

                          <button 
                            onClick={() => setActiveAnalyst("whale")}
                            className={`p-3.5 rounded-xl border text-left transition-all relative ${
                              activeAnalyst === 'whale' 
                                ? 'bg-secondary-container/10 border-secondary text-secondary font-black shadow-lg shadow-black/20' 
                                : 'bg-surface-container-high/20 border-outline-variant/15 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/35'
                            }`}
                          >
                            <span className="text-[11px] font-black block uppercase tracking-wide">Whale Flow Tracker</span>
                            <span className="text-[8px] font-label-caps opacity-60 block mt-1">Orderbook Blocks & Big Wallets</span>
                            {activeAnalyst === 'whale' && <div className="absolute right-3 top-4 w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />}
                          </button>
                        </div>

                        {/* Interactive prompt terminal panel console */}
                        <div className="col-span-12 lg:col-span-9 bg-background/60 rounded-2xl border border-outline-variant/15 shadow-2xl p-5 flex flex-col h-[230px] justify-between relative overflow-hidden">
                          {/* Inner scanner background overlay */}
                          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] opacity-10 pointer-events-none" />
                          
                          {/* console terminal header */}
                          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/15 z-10 shrink-0">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                              <span className="font-label-caps text-[9px] text-outline font-black uppercase tracking-wider">
                                {activeAnalyst.toUpperCase()} DESK SYNCED // STATUS: ONLINE
                              </span>
                            </div>
                            <span className="text-[8px] font-label-caps text-outline uppercase font-bold">SECURE SHELL</span>
                          </div>

                          {/* terminal text logger */}
                          <div className="flex-1 my-3 overflow-y-auto no-scrollbar font-label-caps text-xs text-on-surface leading-relaxed z-10 py-1">
                            {isSynthesizing ? (
                              <div className="flex items-center gap-2 text-secondary animate-pulse">
                                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                                <span>COMPILING VECTORS FOR ARTIFACT ANALYSIS... SYNTHESIS IN PROGRESS...</span>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap font-medium">{terminalOutput}</p>
                            )}
                          </div>

                          {/* Command buttons and input bar */}
                          <div className="space-y-2 z-10 shrink-0 border-t border-outline-variant/10 pt-3">
                            <div className="flex flex-wrap gap-2">
                              <button 
                                onClick={() => executeAICommand("correlations")}
                                disabled={isSynthesizing}
                                className="px-3 py-1.5 rounded-lg bg-surface-container-high/40 hover:bg-secondary/15 text-[9px] font-label-caps font-bold border border-outline-variant/20 hover:border-secondary/40 text-on-surface hover:text-secondary transition-all disabled:opacity-50"
                              >
                                [RUN CORRELATIONS]
                              </button>
                              <button 
                                onClick={() => executeAICommand("risk")}
                                disabled={isSynthesizing}
                                className="px-3 py-1.5 rounded-lg bg-surface-container-high/40 hover:bg-secondary/15 text-[9px] font-label-caps font-bold border border-outline-variant/20 hover:border-secondary/40 text-on-surface hover:text-secondary transition-all disabled:opacity-50"
                              >
                                [ASSESS SYSTEM RISK]
                              </button>
                              <button 
                                onClick={() => executeAICommand("flows")}
                                disabled={isSynthesizing}
                                className="px-3 py-1.5 rounded-lg bg-surface-container-high/40 hover:bg-secondary/15 text-[9px] font-label-caps font-bold border border-outline-variant/20 hover:border-secondary/40 text-on-surface hover:text-secondary transition-all disabled:opacity-50"
                              >
                                [SYNTHESIZE FLOWS]
                              </button>
                            </div>

                            {/* Type in query input */}
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                executeAICommand("custom");
                              }}
                              className="relative flex items-center group mt-1"
                            >
                              <span className="font-label-caps text-[10px] text-secondary absolute left-3 select-none pointer-events-none">{`>`}</span>
                              <input 
                                type="text"
                                placeholder="ENTER CUSTOM ANALYSIS PAYLOAD INSTRUCTION..."
                                value={customQuery}
                                onChange={(e) => setCustomQuery(e.target.value)}
                                disabled={isSynthesizing}
                                className="w-full bg-background/80 border border-outline-variant/20 focus:border-secondary/40 rounded-xl py-2 pl-7 pr-12 text-[10px] font-label-caps text-on-surface focus:outline-none focus:bg-background transition-all placeholder:text-outline/35 disabled:opacity-50"
                              />
                              <button 
                                type="submit" 
                                disabled={isSynthesizing || !customQuery.trim()}
                                className="absolute right-2 px-2.5 py-1 text-[8px] font-label-caps font-black uppercase text-secondary hover:text-white border border-secondary/25 hover:border-secondary rounded-md bg-secondary/5 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                RUN
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-12 flex flex-col items-center justify-center text-on-surface-variant opacity-50 space-y-3 py-14"
                  >
                    <span className="material-symbols-outlined text-[44px]">analytics</span>
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
 
export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant opacity-50 space-y-4 py-20 bg-background h-screen">
        <span className="material-symbols-outlined text-[48px] animate-spin text-secondary">sync</span>
        <p className="font-label-caps text-xs tracking-widest uppercase">Initializing Tactical Command Center...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
