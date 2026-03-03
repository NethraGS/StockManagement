import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePortfolio } from "@/context/PortfolioContext";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, ShoppingCart, TrendingDown } from "lucide-react";

interface BuySellModalProps {
  open: boolean;
  onClose: () => void;
  symbol: string;
  price: number;
  mode: "BUY" | "SELL";
}

const BuySellModal: React.FC<BuySellModalProps> = ({ open, onClose, symbol, price, mode }) => {
  const { buyStock, sellStock, cashBalance, getHolding } = usePortfolio();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const holding = getHolding(symbol);
  const total = price * quantity;
  const isBuy = mode === "BUY";

  const canExecute = isBuy
    ? total <= cashBalance
    : holding !== undefined && holding.quantity >= quantity;

  const handleExecute = () => {
    const result = isBuy ? buyStock(symbol, price, quantity) : sellStock(symbol, price, quantity);

    toast({
      title: result.success ? (isBuy ? "Order Placed" : "Shares Sold") : "Order Failed",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    if (result.success) {
      setQuantity(1);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm border-border bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBuy ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gain/10">
                <ShoppingCart className="h-4 w-4 text-gain" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-loss/10">
                <TrendingDown className="h-4 w-4 text-loss" />
              </div>
            )}
            <span>
              {mode} {symbol}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Price */}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span className="text-sm text-muted-foreground">Market Price</span>
            <span className="text-sm font-bold text-foreground">₹{price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
          </div>

          {/* Quantity selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted transition-colors hover:bg-muted/80"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="flex-1 rounded-lg border border-border bg-muted/50 py-2 text-center text-sm font-bold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted transition-colors hover:bg-muted/80"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-sm text-muted-foreground">Total Amount</span>
            <span className="text-lg font-bold text-foreground">₹{total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
          </div>

          {/* Balance info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Available Cash: ₹{cashBalance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
            {!isBuy && holding && <span>Holding: {holding.quantity} shares</span>}
          </div>

          {!canExecute && (
            <p className="text-xs text-loss bg-loss/10 rounded-lg px-3 py-2">
              {isBuy ? "Insufficient cash balance" : "Not enough shares to sell"}
            </p>
          )}

          {/* Action button */}
          <button
            onClick={handleExecute}
            disabled={!canExecute}
            className={`w-full rounded-lg py-2.5 text-sm font-semibold text-white shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              isBuy
                ? "bg-gain hover:bg-gain/90 shadow-gain/20"
                : "bg-loss hover:bg-loss/90 shadow-loss/20"
            }`}
          >
            {isBuy ? `Buy ${quantity} Share${quantity > 1 ? "s" : ""}` : `Sell ${quantity} Share${quantity > 1 ? "s" : ""}`}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuySellModal;
