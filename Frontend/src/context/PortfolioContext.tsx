import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { fetchPortfolios, fetchHoldings } from "../services/portfolioApi";
import { createTransaction, fetchTransactions } from "../services/transactionApi";

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

const STORAGE_KEY_BASE = "wealthpulse";
const STORAGE_KEY_HOLDINGS = (user?: { email?: string }) => `${STORAGE_KEY_BASE}_holdings${user && user.email ? '_' + user.email : ''}`;
const STORAGE_KEY_CASH = (user?: { email?: string }) => `${STORAGE_KEY_BASE}_cash${user && user.email ? '_' + user.email : ''}`;
const STORAGE_KEY_TXN = (user?: { email?: string }) => `${STORAGE_KEY_BASE}_transactions${user && user.email ? '_' + user.email : ''}`;

const INITIAL_CASH = 100000; // ₹1,00,000

/* ── Provider ───────────────────────────────────────────────── */

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user: authUser } = useAuth();

  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);

  const [holdings, setHoldings] = useState<Holding[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HOLDINGS(authUser as any));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [cashBalance, setCashBalance] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CASH(authUser as any));
      return stored ? Number(stored) : INITIAL_CASH;
    } catch {
      return INITIAL_CASH;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TXN(authUser as any));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_HOLDINGS(authUser as any), JSON.stringify(holdings)); } catch {}
  }, [holdings, authUser]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_CASH(authUser as any), String(cashBalance)); } catch {}
  }, [cashBalance, authUser]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_TXN(authUser as any), JSON.stringify(transactions)); } catch {}
  }, [transactions, authUser]);

  // When authenticated, load server-side portfolio, holdings and txns
  useEffect(() => {
    if (!token) return;
    // clear anonymous local fallback so previous user's anonymous data isn't reused
    try {
      localStorage.removeItem(STORAGE_KEY_HOLDINGS(undefined));
      localStorage.removeItem(STORAGE_KEY_CASH(undefined));
      localStorage.removeItem(STORAGE_KEY_TXN(undefined));
    } catch {}
    let mounted = true;
    (async () => {
      try {
        const portfolios = await fetchPortfolios(token);
        if (!mounted) return;
        if (portfolios.length > 0) {
          const p = portfolios[0];
          setSelectedPortfolioId(p.id);
          setCashBalance(p.cashBalance ?? INITIAL_CASH);
          const hs = await fetchHoldings(p.id, token);
          if (!mounted) return;
          // map server holdings to local shape
          setHoldings(hs.map((h: any) => ({ symbol: h.symbol, quantity: Number(h.quantity), avgPrice: Number(h.avgBuyPrice || h.avgPrice || 0) })));
          const txs = await fetchTransactions(p.id, token);
          if (!mounted) return;
          setTransactions(txs.map((t: any) => ({ id: String(t.id), type: t.txnType, symbol: t.symbol, quantity: Number(t.quantity), price: Number(t.price), total: Number(t.price) * Number(t.quantity), timestamp: new Date(t.txnDate).getTime() })));
        }
      } catch (e) {
        // keep local fallback on error
        console.warn("Portfolio sync failed:", e);
      }
    })();
    return () => { mounted = false; };
  }, [token]);

  /* ── Buy ──────────────────────────────────────────────────── */
  const buyStock = useCallback(
    (symbol: string, price: number, quantity: number) => {
      // if authenticated, perform server-side transaction
      if (token && selectedPortfolioId != null) {
        try {
          const txn = { portfolioId: selectedPortfolioId, symbol, txnType: "BUY" as const, quantity, price, fees: 0 };
          // createTransaction will throw on non-2xx
          createTransaction(txn, token).then((created) => {
            // refresh holdings/txns by reusing effect (simple approach: fetch again)
            fetchHoldings(selectedPortfolioId, token).then((hs) => setHoldings(hs.map((h: any) => ({ symbol: h.symbol, quantity: Number(h.quantity), avgPrice: Number(h.avgBuyPrice || h.avgPrice || 0) }))));
            fetchTransactions(selectedPortfolioId, token).then((txs) => setTransactions(txs.map((t: any) => ({ id: String(t.id), type: t.txnType, symbol: t.symbol, quantity: Number(t.quantity), price: Number(t.price), total: Number(t.price) * Number(t.quantity), timestamp: new Date(t.txnDate).getTime() }))));
            // update cashBalance from server response if present
            if (created && created.portfolio && created.portfolio.cashBalance != null) setCashBalance(Number(created.portfolio.cashBalance));
          }).catch((err) => console.warn("createTransaction failed", err));
          return { success: true, message: `Buy submitted for ${symbol}` };
        } catch (e) {
          return { success: false, message: "Buy failed" };
        }
      }

      // unauthenticated fallback (local)
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
    [cashBalance, token, selectedPortfolioId],
  );

  /* ── Sell ─────────────────────────────────────────────────── */
  const sellStock = useCallback(
    (symbol: string, price: number, quantity: number) => {
      const existing = holdings.find((h) => h.symbol === symbol);
      if (!existing || existing.quantity < quantity) {
        return { success: false, message: existing ? "Not enough shares to sell" : "You don't hold this stock" };
      }

      if (token && selectedPortfolioId != null) {
        try {
          const txn = { portfolioId: selectedPortfolioId, symbol, txnType: "SELL" as const, quantity, price, fees: 0 };
          createTransaction(txn, token).then((created) => {
            fetchHoldings(selectedPortfolioId, token).then((hs) => setHoldings(hs.map((h: any) => ({ symbol: h.symbol, quantity: Number(h.quantity), avgPrice: Number(h.avgBuyPrice || h.avgPrice || 0) }))));
            fetchTransactions(selectedPortfolioId, token).then((txs) => setTransactions(txs.map((t: any) => ({ id: String(t.id), type: t.txnType, symbol: t.symbol, quantity: Number(t.quantity), price: Number(t.price), total: Number(t.price) * Number(t.quantity), timestamp: new Date(t.txnDate).getTime() }))));
            if (created && created.portfolio && created.portfolio.cashBalance != null) setCashBalance(Number(created.portfolio.cashBalance));
          }).catch((err) => console.warn("createTransaction failed", err));
          return { success: true, message: `Sell submitted for ${symbol}` };
        } catch (e) {
          return { success: false, message: "Sell failed" };
        }
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
    [holdings, token, selectedPortfolioId],
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
