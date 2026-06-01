"use client";
 
import { useEffect, useRef } from 'react';
 
declare global {
  interface Window {
    TradingView: any;
  }
}

interface LiveChartProps {
  symbol?: string;
}
 
export default function LiveChart({ symbol = "BINANCE:BTCUSDT" }: LiveChartProps) {
  const container = useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    const initWidget = () => {
      if (typeof window.TradingView !== 'undefined' && container.current) {
        // Clear previous widget and setup inner container for new symbol
        container.current.innerHTML = '<div id="tradingview_full_chart_inner" class="w-full h-full" />';
        
        new window.TradingView.widget({
          "autosize": true,
          "symbol": symbol,
          "interval": "60",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#131316",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "container_id": "tradingview_full_chart_inner",
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
      }
    };
 
    if (typeof window.TradingView !== 'undefined') {
      initWidget();
    } else {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.type = "text/javascript";
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    }
 
    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol]);
 
  return (
    <div className="w-full h-full bg-[#131316] relative flex flex-col">
      <div id="tradingview_full_chart" ref={container} className="w-full h-full z-10" />
    </div>
  );
}
