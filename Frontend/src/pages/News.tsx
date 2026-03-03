import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchNews, type NewsArticle } from "@/services/newsApi";
import NewsCard from "@/components/NewsCard";
import { Newspaper, RefreshCw, AlertCircle, Loader2 } from "lucide-react";

/* ── Constants ──────────────────────────────────────────── */
const CATEGORIES = ["All", "Markets", "Economy", "Stocks", "Global"] as const;
type Category = (typeof CATEGORIES)[number];

const PAGE_SIZE = 10;
const AUTO_REFRESH_MS = 5 * 60 * 1000; // 5 minutes

/* ── Page ───────────────────────────────────────────────── */

const News: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [category, setCategory] = useState<Category>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Debounce ref for category switching
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Fetch ─────────────────────────────────────────────── */
  const loadNews = useCallback(
    async (cat: Category, showLoader = true) => {
      if (showLoader) setLoading(true);
      setError(null);
      try {
        const data = await fetchNews(cat === "All" ? undefined : cat);
        setArticles(data);
        setLastRefresh(new Date());
      } catch {
        setError("Failed to fetch news. Showing cached results.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Initial load
  useEffect(() => {
    loadNews(category);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh every 5 min
  useEffect(() => {
    const timer = setInterval(() => loadNews(category, false), AUTO_REFRESH_MS);
    return () => clearInterval(timer);
  }, [category, loadNews]);

  /* ── Category switch (debounced) ───────────────────────── */
  const handleCategoryChange = (cat: Category) => {
    if (cat === category) return;
    setCategory(cat);
    setVisibleCount(PAGE_SIZE);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadNews(cat), 200);
  };

  const visibleArticles = articles.slice(0, visibleCount);
  const hasMore = visibleCount < articles.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-4/10">
              <Newspaper className="h-5 w-5 text-chart-4" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">Market News</h1>
          </div>
          {/* Manual refresh */}
          <button
            onClick={() => loadNews(category)}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <p className="text-muted-foreground text-sm">Real-time financial news and market updates</p>
          {lastRefresh && (
            <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">
              Updated {lastRefresh.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </motion.div>

      {/* Category filter bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2 mb-6 overflow-x-auto pb-1"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
              category === cat
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 flex items-center gap-2 rounded-lg bg-loss/10 px-4 py-3 text-xs text-loss"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Fetching latest news…</p>
        </div>
      ) : articles.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Newspaper className="h-12 w-12 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">
            No {category !== "All" ? category : ""} news found
          </p>
        </div>
      ) : (
        /* Article list */
        <>
          <div className="space-y-3">
            {visibleArticles.map((article, i) => (
              <NewsCard key={`${article.url}-${i}`} article={article} index={i} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center mt-6"
            >
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Load More ({articles.length - visibleCount} remaining)
              </button>
            </motion.div>
          )}

          {/* Article count */}
          <p className="text-center text-[11px] text-muted-foreground/50 mt-4">
            Showing {visibleArticles.length} of {articles.length} articles
          </p>
        </>
      )}
    </div>
  );
};

export default News;
