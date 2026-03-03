import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { usePortfolio } from "@/context/PortfolioContext";
import { Link } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  BarChart3,
  Briefcase,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { holdings, cashBalance, transactions, totalPortfolioValue } = usePortfolio();

  const portfolioVal = totalPortfolioValue();
  const investedVal = holdings.reduce((sum, h) => sum + h.avgPrice * h.quantity, 0);
  const pnl = portfolioVal - 100000; // compare to initial cash
  const pnlPercent = ((pnl / 100000) * 100).toFixed(2);

  const recentTxns = transactions.slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Welcome back, <span className="gradient-text">{user?.name ?? "Investor"}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Here's your portfolio overview</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          {
            icon: Wallet,
            label: "Total Portfolio",
            value: `₹${portfolioVal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
            sub: `${Number(pnlPercent) >= 0 ? "+" : ""}${pnlPercent}% overall`,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            icon: Briefcase,
            label: "Invested Value",
            value: `₹${investedVal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
            sub: `${holdings.length} stock${holdings.length !== 1 ? "s" : ""}`,
            color: "text-chart-2",
            bg: "bg-chart-2/10",
          },
          {
            icon: BarChart3,
            label: "Cash Balance",
            value: `₹${cashBalance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
            sub: "Available to trade",
            color: "text-chart-3",
            bg: "bg-chart-3/10",
          },
          {
            icon: TrendingUp,
            label: "P&L",
            value: `${pnl >= 0 ? "+" : ""}₹${Math.abs(pnl).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
            sub: pnl >= 0 ? "Profit" : "Loss",
            color: pnl >= 0 ? "text-gain" : "text-loss",
            bg: pnl >= 0 ? "bg-gain/10" : "bg-loss/10",
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <span className="text-sm text-muted-foreground">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <p className={`text-xs mt-1 ${card.color}`}>{card.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Holdings Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card overflow-hidden lg:col-span-2"
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Holdings</h2>
            </div>
            <Link
              to="/portfolio"
              className="text-xs font-medium text-primary hover:underline"
            >
              View All →
            </Link>
          </div>

          {holdings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <Briefcase className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No holdings yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Visit <Link to="/indices" className="text-primary hover:underline">Indices</Link> or{" "}
                <Link to="/crypto" className="text-primary hover:underline">Crypto</Link> to start trading
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="py-3 px-5 text-left font-medium">Symbol</th>
                    <th className="py-3 px-4 text-right font-medium">Qty</th>
                    <th className="py-3 px-4 text-right font-medium">Avg Price</th>
                    <th className="py-3 px-5 text-right font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => (
                    <tr key={h.symbol} className="border-b border-border/50 hover:bg-card/80 transition-colors">
                      <td className="py-3 px-5 font-semibold text-foreground">{h.symbol}</td>
                      <td className="py-3 px-4 text-right text-foreground">{h.quantity}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        ₹{h.avgPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-5 text-right font-semibold text-foreground">
                        ₹{(h.avgPrice * h.quantity).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card overflow-hidden"
        >
          <div className="flex items-center gap-2 p-5 border-b border-border">
            <Clock className="h-5 w-5 text-chart-3" />
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          </div>

          {recentTxns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <Clock className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentTxns.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between px-5 py-3 hover:bg-card/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        txn.type === "BUY" ? "bg-gain/10" : "bg-loss/10"
                      }`}
                    >
                      {txn.type === "BUY" ? (
                        <ArrowUpRight className="h-4 w-4 text-gain" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-loss" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {txn.type} {txn.symbol}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {txn.quantity} × ₹{txn.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${txn.type === "BUY" ? "text-loss" : "text-gain"}`}>
                      {txn.type === "BUY" ? "-" : "+"}₹{txn.total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(txn.timestamp).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
