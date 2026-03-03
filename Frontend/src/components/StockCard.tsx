import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import BuySellModal from "@/components/BuySellModal";
import Sparkline from "@/components/Sparkline";
import { Lock } from "lucide-react";

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  data?: number[];
  index?: number;
}

const StockCard: React.FC<StockCardProps> = ({ symbol, name, price, change, data, index = 0 }) => {
  const { isAuthenticated, setShowAuthModal } = useAuth();
  const [modal, setModal] = useState<{ open: boolean; mode: "BUY" | "SELL" }>({ open: false, mode: "BUY" });

  const positive = change >= 0;

  const handleTrade = (mode: "BUY" | "SELL") => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setModal({ open: true, mode });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.04, duration: 0.35 }}
        className="glass-card-hover p-5 flex flex-col gap-3"
      >
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-foreground">{symbol}</p>
            <p className="text-xs text-muted-foreground">{name}</p>
          </div>
          {data && <Sparkline data={data} positive={positive} width={70} height={28} />}
        </div>

        {/* Price row */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xl font-bold text-foreground">₹{price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
            <p className={`text-xs font-semibold ${positive ? "text-gain" : "text-loss"}`}>
              {positive ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Trade buttons */}
        <div className="flex gap-2 mt-1">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => handleTrade("BUY")}
                className="flex-1 rounded-lg bg-gain/10 py-2 text-xs font-semibold text-gain transition-all hover:bg-gain/20 active:scale-[0.97]"
              >
                Buy
              </button>
              <button
                onClick={() => handleTrade("SELL")}
                className="flex-1 rounded-lg bg-loss/10 py-2 text-xs font-semibold text-loss transition-all hover:bg-loss/20 active:scale-[0.97]"
              >
                Sell
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-muted py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80"
            >
              <Lock className="h-3 w-3" />
              Login to Trade
            </button>
          )}
        </div>
      </motion.div>

      <BuySellModal
        open={modal.open}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
        symbol={symbol}
        price={price}
        mode={modal.mode}
      />
    </>
  );
};

export default StockCard;
