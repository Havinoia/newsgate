"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function IntelligenceMap() {
  const [prices, setPrices] = useState({
    btc: { usd: 68241, change: 2.4 },
    eth: { usd: 3412, change: 1.8 }
  });
  const [sentiment, setSentiment] = useState({ label: "BULLISH", score: 75, change: 12.4 });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Use the correct combined stream format
    const ws = new WebSocket("wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/ethusdt@ticker");

    ws.onopen = () => console.log("Intelligence Terminal: Live Data Stream Connected");

    ws.onmessage = (event) => {
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

    ws.onerror = (error) => console.error("Intelligence Terminal: Stream Error", error);
    ws.onclose = () => console.log("Intelligence Terminal: Stream Disconnected");

    return () => {
      if (ws.readyState === 1) ws.close();
    };
  }, []);

  return (
    <div className="relative h-full w-full bg-background overflow-hidden border-b border-outline-variant/20 group">
      {/* Background Map Image (Stylized) */}
      <div className="absolute inset-0 bg-background overflow-hidden pointer-events-none">
        <img 
          className="w-full h-full object-cover opacity-10 mix-blend-luminosity grayscale scale-110 select-none group-hover:scale-105 transition-transform duration-[10s] ease-linear" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlX9QL44iOsrYn7ZYt74wuGUvDVo5h1Ut1KL45WpGva1g2fBT118CW_9gCs4Y_rAMtLTQuYPQTDYabi8QiDuKF47knsQXNc4ivwiTcmGXZ7a22KVuCavCSZkdCW9kPVgPuB_lRh6X_zgfQpn27UtzI48FXsoYeLeQEcs-wjBSPIV9qSr6gGa4O2nehGj-Jzl2xwSf7pc1i7TO7hYujczm035YCjQfJp-FpNIUoGPPEW_QF5EcqHZS0MLglrRBnEtxMPX9LtEIYtFw"
          alt="Intelligence Map Background"
        />
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

      {/* Floating Hotspots */}
      <div className="absolute top-[35%] left-[22%] group/hotspot">
        <div className="w-3 h-3 bg-secondary rounded-full relative">
            <div className="absolute inset-0 bg-secondary rounded-full animate-ping opacity-75"></div>
            <div className="w-full h-full bg-secondary rounded-full relative z-10 shadow-[0_0_10px_#b4c5ff]"></div>
        </div>
        <div className="absolute -top-16 -left-12 w-48 p-3 bg-surface-container-high/90 backdrop-blur-2xl border border-secondary/30 rounded-xl opacity-0 group-hover/hotspot:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover/hotspot:translate-y-0 shadow-2xl z-20">
          <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1 font-label-caps">NYC Node-01</p>
          <p className="text-[11px] text-on-surface leading-snug font-medium">Market volatility peak detected. SEC announcement imminent.</p>
        </div>
      </div>

      <div className="absolute top-[48%] left-[52%] group/hotspot">
        <div className="w-3 h-3 bg-error rounded-full relative">
            <div className="absolute inset-0 bg-error rounded-full animate-ping opacity-75"></div>
            <div className="w-full h-full bg-error rounded-full relative z-10 shadow-[0_0_10px_#ffb4ab]"></div>
        </div>
        <div className="absolute -top-16 -left-12 w-48 p-3 bg-surface-container-high/90 backdrop-blur-2xl border border-error/30 rounded-xl opacity-0 group-hover/hotspot:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover/hotspot:translate-y-0 shadow-2xl z-20">
          <p className="text-[10px] font-black text-error uppercase tracking-widest mb-1 font-label-caps">EU Node-04</p>
          <p className="text-[11px] text-on-surface leading-snug font-medium">Brussels trade council session active. High impact sanctions pending.</p>
        </div>
      </div>

      <div className="absolute top-[65%] left-[78%] group/hotspot">
        <div className="w-3 h-3 bg-tertiary rounded-full relative">
            <div className="absolute inset-0 bg-tertiary rounded-full animate-ping opacity-75"></div>
            <div className="w-full h-full bg-tertiary rounded-full relative z-10 shadow-[0_0_10px_#c3c0ff]"></div>
        </div>
        <div className="absolute -top-16 -left-12 w-48 p-3 bg-surface-container-high/90 backdrop-blur-2xl border border-tertiary/30 rounded-xl opacity-0 group-hover/hotspot:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover/hotspot:translate-y-0 shadow-2xl z-20">
          <p className="text-[10px] font-black text-tertiary uppercase tracking-widest mb-1 font-label-caps">Asia Node-09</p>
          <p className="text-[11px] text-on-surface leading-snug font-medium">Tech supply chain anomaly detected in Shenzhen corridor.</p>
        </div>
      </div>

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
