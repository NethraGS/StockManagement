import React from "react";
import { motion } from "framer-motion";
import { Clock, ExternalLink, Newspaper } from "lucide-react";
import type { NewsArticle } from "@/services/newsApi";

/* ── Category badge colors ──────────────────────────────── */
const categoryColor: Record<string, string> = {
  Markets: "bg-chart-1/10 text-chart-1",
  Economy: "bg-chart-2/10 text-chart-2",
  Stocks: "bg-chart-3/10 text-chart-3",
  Global: "bg-chart-4/10 text-chart-4",
};

/* ── Relative time helper ───────────────────────────────── */
function timeAgo(isoDate: string | null): string {
  if (!isoDate) return "";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ── Component ──────────────────────────────────────────── */

interface NewsCardProps {
  article: NewsArticle;
  index: number;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, index }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ x: 4 }}
      onClick={() => article.url && window.open(article.url, "_blank", "noopener")}
      className="glass-card-hover p-5 group cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail or icon */}
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt=""
            className="hidden sm:block h-20 w-28 flex-shrink-0 rounded-lg object-cover bg-muted"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="hidden sm:flex h-20 w-28 flex-shrink-0 items-center justify-center rounded-lg bg-muted/50">
            <Newspaper className="h-6 w-6 text-muted-foreground/40" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                categoryColor[article.category] ?? "bg-secondary text-muted-foreground"
              }`}
            >
              {article.category}
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(article.publishedAt)}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>

          <p className="text-xs text-muted-foreground mt-1.5">{article.source}</p>
        </div>

        {/* External link indicator */}
        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
      </div>
    </motion.article>
  );
};

export default NewsCard;
