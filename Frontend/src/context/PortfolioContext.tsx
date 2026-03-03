import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

/* ── Types ──────────────────────────────────────────────────── */

export interface Holding {
  symbol: string;
  quantity: number;
  avgPrice: number;
}

export interface Transaction {
  id: string;
  type: "BUY" | "SELL";
  symbol: string;
  quantity: number;
  price: number;
  total: number;
  timestamp: number;
}

interface PortfolioContextType {
  holdings: Holding[];
  cashBalance: number;
  transactions: Transaction[];
  buyStock: (symbol: string, price: number, quantity: number) => { success: boolean; message: string };
  sellStock: (symbol: string, price: number, quantity: number) => { success: boolean; message: string };
  getHolding: (symbol: string) => Holding | undefined;
  totalPortfolioValue: (priceMap?: Record<string, number>) => number;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const STORAGE_KEY_HOLDINGS = "wealthpulse_holdings";
const STORAGE_KEY_CASH = "wealthpulse_cash";
const STORAGE_KEY_TXN = "wealthpulse_transactions";

const INITIAL_CASH = 100000; // ₹1,00,000

/* ── Provider ───────────────────────────────────────────────── */

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [holdings, setHoldings] = useState<Holding[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HOLDINGS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [cashBalance, setCashBalance] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CASH);
      return stored ? Number(stored) : INITIAL_CASH;
    } catch {
      return INITIAL_CASH;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TXN);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HOLDINGS, JSON.stringify(holdings));
  }, [holdings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CASH, String(cashBalance));
  }, [cashBalance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TXN, JSON.stringify(transactions));
  }, [transactions]);

  /* ── Buy ──────────────────────────────────────────────────── */
  const buyStock = useCallback(
    (symbol: string, price: number, quantity: number) => {
      const total = price * quantity;
      if (total > cashBalance) {
        return { success: false, message: "Insufficient cash balance" };
      }

      setCashBalance((prev) => prev - total);

      setHoldings((prev) => {
        const existing = prev.find((h) => h.symbol === symbol);
        if (existing) {
          const newQty = existing.quantity + quantity;
          const newAvg = (existing.avgPrice * existing.quantity + total) / newQty;
          return prev.map((h) => (h.symbol === symbol ? { ...h, quantity: newQty, avgPrice: newAvg } : h));
        }
        return [...prev, { symbol, quantity, avgPrice: price }];
      });

      setTransactions((prev) => [
        { id: crypto.randomUUID(), type: "BUY", symbol, quantity, price, total, timestamp: Date.now() },
        ...prev,
      ]);

      return { success: true, message: `Successfully bought ${quantity} shares of ${symbol}` };
    },
    [cashBalance],
  );

  /* ── Sell ─────────────────────────────────────────────────── */
  const sellStock = useCallback(
    (symbol: string, price: number, quantity: number) => {
      const existing = holdings.find((h) => h.symbol === symbol);
      if (!existing || existing.quantity < quantity) {
        return { success: false, message: existing ? "Not enough shares to sell" : "You don't hold this stock" };
      }

      const total = price * quantity;
      setCashBalance((prev) => prev + total);

      setHoldings((prev) => {
        const newQty = existing.quantity - quantity;
        if (newQty === 0) return prev.filter((h) => h.symbol !== symbol);
        return prev.map((h) => (h.symbol === symbol ? { ...h, quantity: newQty } : h));
      });

      setTransactions((prev) => [
        { id: crypto.randomUUID(), type: "SELL", symbol, quantity, price, total, timestamp: Date.now() },
        ...prev,
      ]);

      return { success: true, message: `Successfully sold ${quantity} shares of ${symbol}` };
    },
    [holdings],
  );

  const getHolding = useCallback((symbol: string) => holdings.find((h) => h.symbol === symbol), [holdings]);

  const totalPortfolioValue = useCallback(
    (priceMap?: Record<string, number>) => {
      const holdingValue = holdings.reduce((sum, h) => {
        const price = priceMap?.[h.symbol] ?? h.avgPrice;
        return sum + price * h.quantity;
      }, 0);
      return holdingValue + cashBalance;
    },
    [holdings, cashBalance],
  );

  return (
    <PortfolioContext.Provider value={{ holdings, cashBalance, transactions, buyStock, sellStock, getHolding, totalPortfolioValue }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = (): PortfolioContextType => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
};
