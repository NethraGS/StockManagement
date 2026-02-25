import React from "react";
import { motion } from "framer-motion";
import { MOCK_NEWS } from "@/data/mockData";
import { Clock, ExternalLink } from "lucide-react";

const categoryColor: Record<string, string> = {
  Markets: "bg-chart-1/10 text-chart-1",
  Economy: "bg-chart-2/10 text-chart-2",
  Stocks: "bg-chart-3/10 text-chart-3",
  Global: "bg-chart-4/10 text-chart-4",
};

const News = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Market News</h1>
        <p className="text-muted-foreground mb-8">Latest financial news and market updates</p>
      </motion.div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["All", "Markets", "Economy", "Stocks", "Global"].map((cat) => (
          <button
            key={cat}
            className="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {MOCK_NEWS.map((news, i) => (
          <motion.article
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card-hover p-5 group cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor[news.category] || ""}`}>
                    {news.category}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {news.time}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {news.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{news.source}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
};

export default News;
