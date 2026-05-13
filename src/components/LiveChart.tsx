"use client";

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

export default function LiveChart() {
  const container = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Jika sudah diinisialisasi, jangan buat lagi
    if (isInitialized.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== 'undefined' && container.current && !isInitialized.current) {
        new window.TradingView.widget({
          "autosize": true,
          "symbol": "BINANCE:BTCUSDT",
          "interval": "60",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#131316",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "container_id": "tradingview_full_chart",
          "withdateranges": true,
          "hide_side_toolbar": false,
          "hide_volume": true,
          "details": true,
          "hotlist": true,
          "calendar": true,
          "show_popup_button": true,
          "popup_width": "1000",
          "popup_height": "650",
          "backgroundColor": "#131316",
          "gridColor": "rgba(43, 43, 67, 0.1)"
        });
        isInitialized.current = true;
      }
    };

    document.head.appendChild(script);

    return () => {
      // Kita tidak menghapus script agar tidak lambat saat buka-tutup map/chart
      // Tapi kita bersihkan container
      if (container.current) {
        container.current.innerHTML = '';
      }
      isInitialized.current = false;
    };
  }, []);

  return (
    <div className="w-full h-full bg-[#131316] relative flex flex-col">
      <div id="tradingview_full_chart" ref={container} className="w-full h-full z-10" />
    </div>
  );
}
