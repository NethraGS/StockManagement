import React from "react";
import { MOCK_INDICES } from "@/data/mockData";
import Sparkline from "./Sparkline";

const MarketTicker: React.FC = () => {
  const items = [...MOCK_INDICES, ...MOCK_INDICES];

  return (
    <div className="overflow-hidden border-b border-border bg-card/30">
      <div className="ticker-scroll flex items-center gap-8 py-2 px-4 whitespace-nowrap">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">{item.name}</span>
            <span className="text-xs font-semibold text-foreground">
              {item.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
            <span className={`text-xs font-medium ${item.change >= 0 ? "text-gain" : "text-loss"}`}>
              {item.change >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%
            </span>
            <Sparkline data={item.data} positive={item.change >= 0} width={50} height={16} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;
