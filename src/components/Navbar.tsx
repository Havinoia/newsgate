"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function NavLinks() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  const categories = [
    { name: "Latest", slug: "all", href: "/" },
    { name: "Technology", slug: "technology", href: "/?category=technology" },
    { name: "Business", slug: "business", href: "/?category=business" },
    { name: "Politics", slug: "politics", href: "/?category=politics" },
    { name: "Sports", slug: "sports", href: "/?category=sports" },
    { name: "Entertainment", slug: "entertainment", href: "/?category=entertainment" },
    { name: "Health", slug: "health", href: "/?category=health" },
    { name: "Game", slug: "game", href: "/?category=game" },
  ];

  return (
    <nav className="hidden lg:flex items-center gap-6">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.slug;
        return (
          <Link
            key={cat.slug}
            className={`font-headline-md text-sm transition-colors whitespace-nowrap ${
              isActive
                ? "font-bold text-primary border-b-2 border-primary pb-1"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            href={cat.href}
          >
            {cat.name}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/50">
      <div className="flex justify-between items-center h-16 px-margin-desktop max-w-container-max mx-auto relative">
        <div className="flex items-center gap-8">
          <Link className="font-headline-lg text-2xl font-extrabold tracking-tighter text-on-surface" href="/">
            NewsGate
          </Link>
          <Suspense fallback={<div className="h-4 w-48 bg-white/5 animate-pulse rounded" />}>
            <NavLinks />
          </Suspense>
        </div>

        <div className="flex items-center gap-4 relative">
          <AnimatePresence>
            {isSearchOpen && (
              <motion.form
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                onSubmit={handleSearch}
                className="absolute right-12 top-1/2 -translate-y-1/2 overflow-hidden"
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2 px-4 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                />
              </motion.form>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-2 transition-all duration-300 rounded-full active:scale-95 ${isSearchOpen ? 'text-primary bg-white/10' : 'text-on-surface-variant hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined">{isSearchOpen ? 'close' : 'search'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
