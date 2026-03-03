import React from "react";
import { motion } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";
import { useAuth } from "@/context/AuthContext";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

const Portfolio: React.FC = () => {
  const { user } = useAuth();
  const { holdings, cashBalance, transactions, totalPortfolioValue } = usePortfolio();

  const portfolioVal = totalPortfolioValue();
  const investedVal = holdings.reduce((sum, h) => sum + h.avgPrice * h.quantity, 0);
  const unrealizedPnL = 0; // would need live prices; showing invested value as proxy
  const dayChange = 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <PieChart className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Portfolio</h1>
        </div>
        <p className="text-muted-foreground">{user?.name}'s investment portfolio</p>
      </motion.div>

      {/* Summary strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          {
            icon: Wallet,
            label: "Portfolio Value",
            value: `₹${portfolioVal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            icon: BarChart3,
            label: "Invested",
            value: `₹${investedVal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
            color: "text-chart-2",
            bg: "bg-chart-2/10",
          },
          {
            icon: TrendingUp,
            label: "Cash Available",
            value: `₹${cashBalance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
            color: "text-chart-3",
            bg: "bg-chart-3/10",
          },
          {
            icon: RefreshCw,
            label: "Total Trades",
            value: String(transactions.length),
            color: "text-chart-4",
            bg: "bg-chart-4/10",
          },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.bg}`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
              <span className="text-xs text-muted-foreground">{c.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{c.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Holdings */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card overflow-hidden mb-8"
      >
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">All Holdings</h2>
        </div>

        {holdings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <PieChart className="h-14 w-14 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground text-sm">Your portfolio is empty</p>
            <p className="text-xs text-muted-foreground mt-1">Start buying stocks to see them here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="py-3 px-5 text-left font-medium">Symbol</th>
                  <th className="py-3 px-4 text-right font-medium">Quantity</th>
                  <th className="py-3 px-4 text-right font-medium">Avg Price</th>
                  <th className="py-3 px-4 text-right font-medium">Current Value</th>
                  <th className="py-3 px-5 text-right font-medium">Weight</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h, i) => {
                  const val = h.avgPrice * h.quantity;
                  const weight = investedVal > 0 ? ((val / investedVal) * 100).toFixed(1) : "0";
                  return (
                    <motion.tr
                      key={h.symbol}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-border/50 hover:bg-card/80 transition-colors"
                    >
                      <td className="py-3 px-5 font-semibold text-foreground">{h.symbol}</td>
                      <td className="py-3 px-4 text-right text-foreground">{h.quantity}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        ₹{h.avgPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-foreground">
                        ₹{val.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {weight}%
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Transaction History</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="h-10 w-10 text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="py-3 px-5 text-left font-medium">Type</th>
                  <th className="py-3 px-4 text-left font-medium">Symbol</th>
                  <th className="py-3 px-4 text-right font-medium">Qty</th>
                  <th className="py-3 px-4 text-right font-medium">Price</th>
                  <th className="py-3 px-4 text-right font-medium">Total</th>
                  <th className="py-3 px-5 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, i) => (
                  <motion.tr
                    key={txn.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/50 hover:bg-card/80 transition-colors"
                  >
                    <td className="py-3 px-5">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          txn.type === "BUY" ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"
                        }`}
                      >
                        {txn.type === "BUY" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {txn.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">{txn.symbol}</td>
                    <td className="py-3 px-4 text-right text-foreground">{txn.quantity}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">
                      ₹{txn.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-foreground">
                      ₹{txn.total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-5 text-right text-xs text-muted-foreground">
                      {new Date(txn.timestamp).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Portfolio;
