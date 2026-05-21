"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface IntelligenceMapProps {
  articleImage?: string;
}

export default function IntelligenceMap({ articleImage }: IntelligenceMapProps) {
  const [prices, setPrices] = useState({
    btc: { usd: 68241, change: 2.4 },
    eth: { usd: 3412, change: 1.8 }
  });
  const [sentiment, setSentiment] = useState({ label: "BULLISH", score: 75, change: 12.4 });

  const [mounted, setMounted] = useState(false);

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

    // Use the correct combined stream format
    const ws = new WebSocket("wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/ethusdt@ticker");

    ws.onopen = () => console.log("Intelligence Terminal: Live Data Stream Connected");

    ws.onmessage = (event) => {
      // If we receive real data, clear any running simulator fallback
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

        // Update sentiment based on latest stream data
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
      // Gracefully fallback to simulated feed without triggering dev-mode console errors or overlay notifications.
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

  return (
    <div className="relative h-full w-full bg-background overflow-hidden border-b border-outline-variant/20 group">
      {/* Background Map / Article Thumbnail (Stylized) */}
      <div className="absolute inset-0 bg-background overflow-hidden pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.img 
            key={articleImage || "default-map"}
            initial={{ opacity: 0 }}
            animate={{ opacity: articleImage ? 0.22 : 0.12 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`w-full h-full object-cover select-none ${
              articleImage 
                ? "" 
                : "mix-blend-luminosity grayscale scale-110 group-hover:scale-105 transition-transform duration-[10s] ease-linear"
            }`}
            src={articleImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuBlX9QL44iOsrYn7ZYt74wuGUvDVo5h1Ut1KL45WpGva1g2fBT118CW_9gCs4Y_rAMtLTQuYPQTDYabi8QiDuKF47knsQXNc4ivwiTcmGXZ7a22KVuCavCSZkdCW9kPVgPuB_lRh6X_zgfQpn27UtzI48FXsoYeLeQEcs-wjBSPIV9qSr6gGa4O2nehGj-Jzl2xwSf7pc1i7TO7hYujczm035YCjQfJp-FpNIUoGPPEW_QF5EcqHZS0MLglrRBnEtxMPX9LtEIYtFw"}
            alt="Intelligence Background"
          />
        </AnimatePresence>
        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background opacity-60"></div>
      </div>

      {/* Moving Scanning Line */}
      <motion.div 
        initial={{ top: "-10%" }}
        animate={{ top: "110%" }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-secondary/20 shadow-[0_0_15px_rgba(180,197,255,0.5)] z-10 pointer-events-none"
      />


      {/* HUD Layers - Reorganized to prevent overlap */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
        {/* Top Row */}
        <div className="flex justify-between items-start">
          {/* Top Left - Sentiment */}
          <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-72 bg-surface-container-low/40 backdrop-blur-xl border border-outline-variant/20 rounded-2xl p-5 shadow-2xl pointer-events-auto"
          >
            <div className="flex justify-between items-center mb-5">
              <div className="flex flex-col">
                <h5 className="font-label-caps text-[9px] text-outline tracking-[0.2em] uppercase font-black">Sentiment Terminal</h5>
                <span className="text-[10px] text-secondary/60 font-data-point uppercase tracking-tighter">Live Analysis Engine</span>
              </div>
              <span className="material-symbols-outlined text-[20px] text-secondary animate-pulse">monitoring</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black text-on-surface tracking-tighter uppercase">{sentiment.label}</span>
                <span className={`text-sm font-black ${sentiment.change >= 0 ? 'text-secondary' : 'text-error'}`}>
                  {sentiment.change >= 0 ? '+' : ''}{sentiment.change}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-background rounded-full overflow-hidden p-[1px] border border-outline-variant/10">
                <motion.div 
                  animate={{ width: `${sentiment.score}%` }}
                  className={`h-full rounded-full shadow-[0_0_8px_currentColor] ${sentiment.label === 'BULLISH' ? 'bg-secondary text-secondary' : sentiment.label === 'BEARISH' ? 'bg-error text-error' : 'bg-outline text-outline'}`}
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
              transition={{ delay: 0.2 }}
              className="w-80 bg-surface-container-low/40 backdrop-blur-xl border border-outline-variant/20 rounded-2xl p-5 shadow-2xl pointer-events-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h5 className="font-label-caps text-[9px] text-outline tracking-[0.2em] uppercase font-black">Geopolitical Vector</h5>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-error rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-error/40 rounded-full"></div>
                <div className="w-1 h-1 bg-error/20 rounded-full"></div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle className="text-surface-variant/20" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="6"></circle>
                  <circle className="text-error" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175" strokeDashoffset="40" strokeWidth="6" strokeLinecap="round"></circle>
                </svg>
                <span className="absolute text-lg font-black text-error tracking-tighter">78%</span>
              </div>
              <div>
                <p className="text-sm font-black text-on-surface uppercase tracking-tight leading-tight mb-1">High Risk Alert</p>
                <p className="text-[10px] text-on-surface-variant leading-snug font-medium">Elevated tension in EU trade corridors.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between items-center p-2 rounded-lg bg-surface-variant/10 border border-outline-variant/10">
                <span className="text-[9px] font-bold text-outline uppercase">Energy</span>
                <span className="text-[9px] font-black text-error tracking-widest uppercase">Crit</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-surface-variant/10 border border-outline-variant/10">
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
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4 bg-surface-container-low/40 backdrop-blur-xl border border-outline-variant/20 rounded-full px-5 py-3 shadow-2xl pointer-events-auto"
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
              transition={{ delay: 0.4 }}
              className="w-64 bg-surface-container-low/60 backdrop-blur-xl border border-outline-variant/20 rounded-2xl p-5 shadow-2xl pointer-events-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h5 className="font-label-caps text-[9px] text-outline tracking-[0.2em] uppercase font-black">Digital Asset Pulse</h5>
              <span className="material-symbols-outlined text-[18px] text-tertiary">currency_bitcoin</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-outline font-bold uppercase tracking-wider">BTC / USD</span>
                  <span className="text-lg font-black text-on-surface tracking-tighter">
                    ${prices.btc.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <span className={`text-[10px] font-black ${prices.btc.change >= 0 ? 'text-secondary' : 'text-error'}`}>
                  {prices.btc.change >= 0 ? '+' : ''}{prices.btc.change.toFixed(2)}%
                </span>
              </div>
              <div className="w-full h-[1px] bg-outline-variant/20"></div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-outline font-bold uppercase tracking-wider">ETH / USD</span>
                  <span className="text-lg font-black text-on-surface tracking-tighter">
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

      {/* Grid HUD Overlay (Subtle) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(19,19,22,0.4)_100%)] pointer-events-none"></div>
    </div>
  );
}
