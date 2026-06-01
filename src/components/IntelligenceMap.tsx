"use client";
 
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
 
interface IntelligenceMapProps {
  articleImage?: string;
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
}

interface RadarBlip {
  id: number;
  name: string;
  cx: number;
  cy: number;
  risk: "CRITICAL" | "ELEVATED" | "STABLE";
  details: string;
  category: string;
}

export default function IntelligenceMap({ 
  articleImage, 
  activeCategory = "all", 
  onSelectCategory 
}: IntelligenceMapProps) {
  const [prices, setPrices] = useState({
    btc: { usd: 68241, change: 2.4 },
    eth: { usd: 3412, change: 1.8 }
  });
  const [sentiment, setSentiment] = useState({ label: "BULLISH", score: 75, change: 12.4 });
  const [mounted, setMounted] = useState(false);
  const [hoveredBlip, setHoveredBlip] = useState<RadarBlip | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // List of active global vector blips for the radar screen
  const radarBlips: RadarBlip[] = [
    { id: 1, name: "ROTTERDAM SHIPPING NODE", cx: 480, cy: 180, risk: "CRITICAL", details: "Congestion spikes in European trade channels. 78% risk index active.", category: "politics" },
    { id: 2, name: "SUEZ CANAL FLOWS", cx: 560, cy: 260, risk: "ELEVATED", details: "Maritime transit drops following localized regional warnings.", category: "energy" },
    { id: 3, name: "TAIWAN SEMICONDUCTOR FAB", cx: 770, cy: 290, risk: "ELEVATED", details: "Supply logistics routes monitored under heightened signals.", category: "politics" },
    { id: 4, name: "ZURICH VAULT CORRIDOR", cx: 470, cy: 200, risk: "STABLE", details: "Institutional digital asset flow expands at +12.4% week-on-week.", category: "crypto" },
    { id: 5, name: "SINGAPORE LIQUIDITY ROUTE", cx: 720, cy: 340, risk: "STABLE", details: "High volume arbitrage signals indicate whale accumulation patterns.", category: "crypto" },
    { id: 6, name: "GULF OIL EXTRACTION COPE", cx: 280, cy: 250, risk: "CRITICAL", details: "Texas refining pipelines operating under structural restrictions.", category: "energy" }
  ];

  useEffect(() => {
    setMounted(true);
    let fallbackInterval: NodeJS.Timeout | null = null;

    const startFallbackSimulator = () => {
      if (fallbackInterval) return;
      console.log("Intelligence Terminal: Activating local simulated feed fallback");
      fallbackInterval = setInterval(() => {
        setPrices(prev => {
          const btcDiff = (Math.random() - 0.5) * 50;
          const ethDiff = (Math.random() - 0.5) * 3;
          
          const newBtcUsd = Math.max(10000, prev.btc.usd + btcDiff);
          const newEthUsd = Math.max(100, prev.eth.usd + ethDiff);
          
          const btcChange = prev.btc.change + (Math.random() - 0.5) * 0.1;
          const ethChange = prev.eth.change + (Math.random() - 0.5) * 0.1;
          
          const newPrices = {
            btc: { usd: newBtcUsd, change: btcChange },
            eth: { usd: newEthUsd, change: ethChange }
          };

          const avgChange = (newPrices.btc.change + newPrices.eth.change) / 2;
          let label = "NEUTRAL";
          let score = 50;
          if (avgChange > 1) { label = "BULLISH"; score = 75 + avgChange; }
          else if (avgChange > -1) { label = "STABLE"; score = 60 + avgChange; }
          else { label = "BEARISH"; score = 25 + avgChange; }
          
          setSentiment({ 
            label, 
            score: Math.min(Math.max(score, 5), 95), 
            change: Number(avgChange.toFixed(2)) 
          });

          return newPrices;
        });
      }, 3000);
    };

    // Binance WebSocket setup for real-time rates
    const ws = new WebSocket("wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/ethusdt@ticker");

    ws.onopen = () => console.log("Intelligence Terminal: Live Data Stream Connected");

    ws.onmessage = (event) => {
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
        fallbackInterval = null;
      }

      const msg = JSON.parse(event.data);
      const data = msg.data;
      const stream = msg.stream;
      
      setPrices(prev => {
        const newPrices = { ...prev };
        if (stream === "btcusdt@ticker") {
          newPrices.btc = { usd: parseFloat(data.c), change: parseFloat(data.P) };
        } else if (stream === "ethusdt@ticker") {
          newPrices.eth = { usd: parseFloat(data.c), change: parseFloat(data.P) };
        }

        const avgChange = (newPrices.btc.change + newPrices.eth.change) / 2;
        let label = "NEUTRAL";
        let score = 50;
        if (avgChange > 1) { label = "BULLISH"; score = 75 + avgChange; }
        else if (avgChange > -1) { label = "STABLE"; score = 60 + avgChange; }
        else { label = "BEARISH"; score = 25 + avgChange; }
        
        setSentiment({ 
          label, 
          score: Math.min(Math.max(score, 5), 95), 
          change: Number(avgChange.toFixed(2)) 
        });

        return newPrices;
      });
    };

    ws.onerror = () => {
      startFallbackSimulator();
    };

    ws.onclose = () => {
      startFallbackSimulator();
    };

    return () => {
      if (ws.readyState === 1) ws.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, []);

  const handleBlipHover = (e: React.MouseEvent<SVGGElement>, blip: RadarBlip) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mapContainer = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (mapContainer) {
      setTooltipPos({
        x: rect.left - mapContainer.left + rect.width / 2,
        y: rect.top - mapContainer.top - 10
      });
    }
    setHoveredBlip(blip);
  };

  return (
    <div className="relative h-full w-full bg-background overflow-hidden border border-outline-variant/10 rounded-2xl group glass-panel shadow-2xl">
      {/* Grid HUD Overlay (Subtle background) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(19,19,22,0.6)_100%)] z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40 z-0" />
      
      {/* Background Map / Article Thumbnail (Cinematic Glass Layer) */}
      <div className="absolute inset-0 bg-background overflow-hidden pointer-events-none z-0">
        <AnimatePresence mode="wait">
          <motion.img 
            key={articleImage || "default-map"}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: articleImage ? 0.28 : 0.15, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className={`w-full h-full object-cover select-none ${
              articleImage 
                ? "filter brightness-75 contrast-125" 
                : "mix-blend-luminosity grayscale scale-105 group-hover:scale-100 transition-transform duration-[12s] ease-linear"
            }`}
            src={articleImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuBlX9QL44iOsrYn7ZYt74wuGUvDVo5h1Ut1KL45WpGva1g2fBT118CW_9gCs4Y_rAMtLTQuYPQTDYabi8QiDuKF47knsQXNc4ivwiTcmGXZ7a22KVuCavCSZkdCW9kPVgPuB_lRh6X_zgfQpn27UtzI48FXsoYeLeQEcs-wjBSPIV9qSr6gGa4O2nehGj-Jzl2xwSf7pc1i7TO7hYujczm035YCjQfJp-FpNIUoGPPEW_QF5EcqHZS0MLglrRBnEtxMPX9LtEIYtFw"}
            alt="Intelligence Background"
          />
        </AnimatePresence>
        {/* Scanning Scanline Grid Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_6px] pointer-events-none opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background opacity-75"></div>
      </div>

      {/* Moving Scanning Line */}
      <motion.div 
        initial={{ top: "-10%" }}
        animate={{ top: "110%" }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-secondary/40 to-transparent shadow-[0_0_20px_rgba(180,197,255,0.7)] z-10 pointer-events-none"
      />

      {/* SVGA Live Interactive Sweep Radar overlay */}
      <svg 
        viewBox="0 0 1000 500" 
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full z-10 select-none pointer-events-auto"
      >
        <defs>
          <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(180,197,255,0.08)" />
            <stop offset="70%" stopColor="rgba(180,197,255,0.03)" />
            <stop offset="100%" stopColor="rgba(180,197,255,0)" />
          </radialGradient>
          <linearGradient id="radar-sweep-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(180, 197, 255, 0)" />
            <stop offset="40%" stopColor="rgba(180, 197, 255, 0.01)" />
            <stop offset="100%" stopColor="rgba(180, 197, 255, 0.18)" />
          </linearGradient>
          <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Concentric grid circles centered at coordinate 500,250 */}
        <circle cx="500" cy="250" r="80" stroke="rgba(180, 197, 255, 0.12)" strokeWidth="1" fill="none" />
        <circle cx="500" cy="250" r="160" stroke="rgba(180, 197, 255, 0.12)" strokeWidth="1" fill="none" />
        <circle cx="500" cy="250" r="240" stroke="rgba(180, 197, 255, 0.08)" strokeWidth="1" strokeDasharray="6 6" fill="none" />
        <circle cx="500" cy="250" r="320" stroke="rgba(180, 197, 255, 0.06)" strokeWidth="1" fill="none" />
        <circle cx="500" cy="250" r="400" stroke="rgba(180, 197, 255, 0.03)" strokeWidth="1" fill="none" />
        
        {/* Radar scope glow */}
        <circle cx="500" cy="250" r="360" fill="url(#radar-glow)" />

        {/* Radar Crosshairs */}
        <line x1="100" y1="250" x2="900" y2="250" stroke="rgba(180, 197, 255, 0.08)" strokeWidth="1" />
        <line x1="500" y1="30" x2="500" y2="470" stroke="rgba(180, 197, 255, 0.08)" strokeWidth="1" />

        {/* Dynamic Sweep Cone */}
        <g className="animate-radar-sweep" style={{ transformOrigin: "500px 250px" }}>
          {/* Main sweep stroke */}
          <line x1="500" y1="250" x2="900" y2="250" stroke="rgba(180, 197, 255, 0.45)" strokeWidth="1.5" filter="url(#glow-effect)" />
          {/* Sweep backdrop fan polygon */}
          <path d="M 500 250 L 900 250 A 400 400 0 0 0 846 50 Z" fill="url(#radar-sweep-grad)" />
        </g>

        {/* Interactive blips representing Geopolitical hot spots */}
        {radarBlips.map((blip) => {
          const isSelectedCategory = activeCategory === blip.category;
          const blipColor = blip.risk === "CRITICAL" ? "rgba(255, 180, 171, 1)" : blip.risk === "ELEVATED" ? "rgba(195, 192, 255, 1)" : "rgba(180, 197, 255, 1)";
          const glowColor = blip.risk === "CRITICAL" ? "rgba(255, 180, 171, 0.3)" : blip.risk === "ELEVATED" ? "rgba(195, 192, 255, 0.3)" : "rgba(180, 197, 255, 0.3)";

          return (
            <g 
              key={blip.id}
              className="cursor-pointer"
              onMouseEnter={(e) => handleBlipHover(e, blip)}
              onMouseLeave={() => setHoveredBlip(null)}
              onClick={() => onSelectCategory && onSelectCategory(blip.category)}
            >
              {/* Outer pulsing ring */}
              <circle 
                cx={blip.cx} 
                cy={blip.cy} 
                r="18" 
                fill="transparent" 
                stroke={blipColor} 
                strokeWidth="1" 
                className="opacity-50"
                style={{ transformOrigin: `${blip.cx}px ${blip.cy}px` }}
              >
                <animate attributeName="r" values="6;24;6" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite" />
              </circle>

              {/* Glowing halo */}
              <circle 
                cx={blip.cx} 
                cy={blip.cy} 
                r={isSelectedCategory ? 10 : 7} 
                fill={glowColor}
                className="transition-all duration-300"
              />

              {/* Solid center dot */}
              <circle 
                cx={blip.cx} 
                cy={blip.cy} 
                r={isSelectedCategory ? 5 : 3.5} 
                fill={blipColor}
                className="animate-blip-pulse"
                style={{ color: blipColor }}
              />
            </g>
          );
        })}
      </svg>

      {/* SVG Blip Tooltip (HTML overlay) */}
      <AnimatePresence>
        {hoveredBlip && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            style={{ 
              left: `${tooltipPos.x}px`, 
              top: `${tooltipPos.y}px`,
              transform: "translate(-50%, -100%)" 
            }}
            className="absolute z-50 glass-panel-heavy p-4 rounded-xl border border-outline-variant/40 shadow-2xl w-64 pointer-events-none"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-label-caps text-[9px] text-outline tracking-wider font-bold">RADAR VECTOR</span>
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                hoveredBlip.risk === 'CRITICAL' ? 'bg-error/20 text-error' : hoveredBlip.risk === 'ELEVATED' ? 'bg-tertiary/20 text-tertiary' : 'bg-secondary/20 text-secondary'
              }`}>
                {hoveredBlip.risk}
              </span>
            </div>
            <h6 className="text-[11px] font-black text-on-surface uppercase tracking-tight mb-1.5">{hoveredBlip.name}</h6>
            <p className="text-[10px] text-on-surface-variant leading-relaxed font-body-md mb-2">{hoveredBlip.details}</p>
            <div className="flex justify-between items-center pt-2 border-t border-outline-variant/15 text-[8px] font-label-caps font-bold">
              <span className="text-secondary/60">SECTOR: {hoveredBlip.category.toUpperCase()}</span>
              <span className="text-outline uppercase">Click to Filter News</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD Layers - Reorganized to prevent overlap */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none z-20">
        {/* Top Row */}
        <div className="flex justify-between items-start">
          {/* Top Left - Sentiment */}
          <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-72 bg-surface-container-low/30 backdrop-blur-md border border-outline-variant/15 rounded-2xl p-4 shadow-2xl pointer-events-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col">
                <h5 className="font-label-caps text-[9px] text-outline tracking-[0.2em] uppercase font-black">Sentiment Terminal</h5>
                <span className="text-[10px] text-secondary/60 font-data-point uppercase tracking-tighter">Live Analysis Engine</span>
              </div>
              <span className="material-symbols-outlined text-[18px] text-secondary animate-pulse text-glow" style={{ color: "var(--color-secondary)" }}>monitoring</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-black text-on-surface tracking-tighter uppercase">{sentiment.label}</span>
                <span className={`text-xs font-black ${sentiment.change >= 0 ? 'text-secondary' : 'text-error'}`}>
                  {sentiment.change >= 0 ? '+' : ''}{sentiment.change}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-background/50 rounded-full overflow-hidden p-[1px] border border-outline-variant/10">
                <motion.div 
                  animate={{ width: `${sentiment.score}%` }}
                  className={`h-full rounded-full shadow-[0_0_8px_currentColor] transition-all duration-500 ${
                    sentiment.label === 'BULLISH' ? 'bg-secondary text-secondary' : sentiment.label === 'BEARISH' ? 'bg-error text-error' : 'bg-outline text-outline'
                  }`}
                />
              </div>
              <div className="flex justify-between font-label-caps text-[8px] text-outline font-bold">
                <span>BEARISH</span>
                <span>NEUTRAL</span>
                <span>BULLISH</span>
              </div>
            </div>
          </motion.div>

          {/* Top Right - Geopolitical */}
          <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="w-80 bg-surface-container-low/30 backdrop-blur-md border border-outline-variant/15 rounded-2xl p-4 shadow-2xl pointer-events-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h5 className="font-label-caps text-[9px] text-outline tracking-[0.2em] uppercase font-black">Geopolitical Vector</h5>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-error rounded-full animate-ping"></div>
                <div className="w-1.5 h-1.5 bg-error/40 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-error/20 rounded-full"></div>
              </div>
            </div>
            
            <div className="flex items-center gap-5 mb-4">
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle className="text-surface-variant/20" cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeWidth="5"></circle>
                  <circle className="text-error" cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeDasharray="150" strokeDashoffset="35" strokeWidth="5" strokeLinecap="round" filter="url(#glow-effect)"></circle>
                </svg>
                <span className="absolute text-sm font-black text-error tracking-tighter text-glow" style={{ color: "var(--color-error)" }}>78%</span>
              </div>
              <div>
                <p className="text-xs font-black text-on-surface uppercase tracking-tight leading-none mb-1">High Risk Alert</p>
                <p className="text-[10px] text-on-surface-variant leading-snug font-medium">Elevated tension in EU trade corridors.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between items-center p-2 rounded-lg bg-surface-variant/15 border border-outline-variant/10">
                <span className="text-[9px] font-bold text-outline uppercase">Energy</span>
                <span className="text-[9px] font-black text-error tracking-widest uppercase">Crit</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-surface-variant/15 border border-outline-variant/10">
                <span className="text-[9px] font-bold text-outline uppercase">Supply</span>
                <span className="text-[9px] font-black text-secondary tracking-widest uppercase">Ok</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="flex justify-between items-end">
          {/* Bottom Left - System Status */}
          <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4 bg-surface-container-low/30 backdrop-blur-md border border-outline-variant/15 rounded-full px-4 py-2 shadow-2xl pointer-events-auto"
          >
            <div className="flex items-center gap-2 border-r border-outline-variant/20 pr-4">
              <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping"></div>
              <span className="font-label-caps text-[9px] text-on-surface font-black tracking-widest uppercase">Global Node Live</span>
            </div>
            <div className="flex items-center gap-6 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-outline font-bold uppercase">Latency</span>
                <span className="text-[9px] text-secondary font-black">18ms</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-outline font-bold uppercase">Uptime</span>
                <span className="text-[9px] text-secondary font-black">99.9%</span>
              </div>
            </div>
          </motion.div>

          {/* Bottom Right - Crypto Pulse */}
          <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-64 bg-surface-container-low/40 backdrop-blur-md border border-outline-variant/15 rounded-2xl p-4 shadow-2xl pointer-events-auto"
          >
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-label-caps text-[9px] text-outline tracking-[0.2em] uppercase font-black">Digital Asset Pulse</h5>
              <span className="material-symbols-outlined text-[16px] text-tertiary">currency_bitcoin</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[9px] text-outline font-bold uppercase tracking-wider">BTC / USD</span>
                  <span className="text-base font-black text-on-surface tracking-tighter">
                    ${prices.btc.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <span className={`text-[10px] font-black ${prices.btc.change >= 0 ? 'text-secondary' : 'text-error'}`}>
                  {prices.btc.change >= 0 ? '+' : ''}{prices.btc.change.toFixed(2)}%
                </span>
              </div>
              <div className="w-full h-[1px] bg-outline-variant/10"></div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[9px] text-outline font-bold uppercase tracking-wider">ETH / USD</span>
                  <span className="text-base font-black text-on-surface tracking-tighter">
                    ${prices.eth.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <span className={`text-[10px] font-black ${prices.eth.change >= 0 ? 'text-secondary' : 'text-error'}`}>
                  {prices.eth.change >= 0 ? '+' : ''}{prices.eth.change.toFixed(2)}%
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
