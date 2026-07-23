"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface ArticleModalProps {
  article: any | null;
  onClose: () => void;
}

export default function ArticleModal({ article, onClose }: ArticleModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!article) return null;

  const readingTime = Math.max(1, Math.ceil((article.content?.split(/\s+/).length || 0) / 200));

  const getCategoryBadgeStyle = (cat: string) => {
    const c = (cat || "").toLowerCase();
    if (c === "crypto") return "bg-secondary/20 text-secondary border-secondary/40";
    if (c === "politics") return "bg-error/20 text-error border-error/40";
    if (c === "energy") return "bg-tertiary/20 text-tertiary border-tertiary/40";
    return "bg-surface-container-high text-on-surface-variant border-outline-variant/30";
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-3xl max-h-[85vh] bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 glass-panel-heavy"
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/70 shrink-0">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${getCategoryBadgeStyle(article.category)}`}>
                {article.category || "General"}
              </span>
              <span className="text-[10px] font-bold text-outline uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Article Content Container */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 no-scrollbar">
            {/* Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-on-surface leading-tight">
              {article.title}
            </h1>

            {/* Meta Ribbon */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-outline border-y border-outline-variant/15 py-3 font-label-caps">
              <div className="flex items-center gap-1.5 text-secondary font-bold">
                <span className="material-symbols-outlined text-[16px]">newspaper</span>
                <span>Sumber: {article.source?.name || "NewsGate Feed"}</span>
              </div>
              <span className="text-outline-variant">•</span>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="material-symbols-outlined text-[16px] text-tertiary">timer</span>
                <span>{readingTime} Menit Baca</span>
              </div>
              <span className="text-outline-variant">•</span>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="material-symbols-outlined text-[16px] text-error">bolt</span>
                <span className={article.sentimentScore >= 70 ? "text-error font-black" : "text-secondary"}>
                  {article.sentimentScore >= 70 ? "HIGH IMPACT" : article.sentimentScore >= 40 ? "MID IMPACT" : "LOW IMPACT"} ({article.sentimentScore}%)
                </span>
              </div>
            </div>

            {/* Featured Image if present */}
            {article.imageUrl && (
              <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-outline-variant/20 relative group">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
            )}

            {/* Body text */}
            <div className="text-sm sm:text-base text-on-surface-variant leading-relaxed space-y-4 font-body-md whitespace-pre-line">
              {article.content ? (
                article.content
              ) : (
                <p className="italic text-outline">
                  (Konten lengkap berita ini dapat diakses langsung melalui situs penerbit asli.)
                </p>
              )}
            </div>

            {/* Footer Action / External Source Link */}
            <div className="pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-outline">
                Dipublikasikan oleh: <span className="text-on-surface font-bold">{article.source?.name || "NewsGate"}</span>
              </div>

              {article.sourceUrl && (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-secondary text-on-secondary font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 active:scale-95"
                >
                  <span>Buka Sumber Asli</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
