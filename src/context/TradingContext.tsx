"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

export interface TrailingStop {
  distance: number;   // absolute price distance
  highWaterMark: number; // best price reached (updated as price moves favorably)
}

export interface DemoPosition {
  id: string;
  market: string;
  side: "long" | "short";
  size: number;
  entryPrice: number;
  leverage: number;
  margin: number;
  fee: number;
  openedAt: Date;
  orderType: "market" | "limit";
  stopLoss?: number;
  takeProfit?: number;
  trailingStop?: TrailingStop;
}

export interface ClosedTrade extends DemoPosition {
  closePrice: number;
  closedAt: Date;
  realizedPnl: number;
  closeReason: "manual" | "stop_loss" | "take_profit" | "trailing_stop" | "liquidation";
}

interface TradingCtx {
  positions: DemoPosition[];
  history: ClosedTrade[];
  openPosition: (pos: Omit<DemoPosition, "id" | "openedAt">) => void;
  closePosition: (id: string, markPrice: number, reason?: ClosedTrade["closeReason"]) => void;
  updatePosition: (id: string, updates: Partial<Pick<DemoPosition, "stopLoss" | "takeProfit" | "trailingStop">>) => void;
}

const TradingContext = createContext<TradingCtx>({
  positions: [],
  history: [],
  openPosition: () => {},
  closePosition: () => {},
  updatePosition: () => {},
});

export function TradingProvider({ children }: { children: ReactNode }) {
  const [positions, setPositions] = useState<DemoPosition[]>([]);
  const [history, setHistory] = useState<ClosedTrade[]>([]);

  const openPosition = useCallback(
    (pos: Omit<DemoPosition, "id" | "openedAt">) => {
      const newPos: DemoPosition = {
        ...pos,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        openedAt: new Date(),
      };
      setPositions((prev) => [...prev, newPos]);
    },
    []
  );

  const closePosition = useCallback(
    (id: string, markPrice: number, reason: ClosedTrade["closeReason"] = "manual") => {
      setPositions((prev) => {
        const pos = prev.find((p) => p.id === id);
        if (!pos) return prev;
        const pnl =
          pos.side === "long"
            ? (markPrice - pos.entryPrice) * pos.size
            : (pos.entryPrice - markPrice) * pos.size;
        const closed: ClosedTrade = {
          ...pos,
          closePrice: markPrice,
          closedAt: new Date(),
          realizedPnl: pnl,
          closeReason: reason,
        };
        setHistory((h) => [closed, ...h]);
        return prev.filter((p) => p.id !== id);
      });
    },
    []
  );

  const updatePosition = useCallback(
    (id: string, updates: Partial<Pick<DemoPosition, "stopLoss" | "takeProfit" | "trailingStop">>) => {
      setPositions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    },
    []
  );

  // Monitor positions for SL/TP/trailing stop triggers
  useEffect(() => {
    if (positions.length === 0) return;

    const interval = setInterval(async () => {
      // Fetch current mark prices for all open markets
      const markets = Array.from(new Set(positions.map((p) => p.market)));
      try {
        const res = await fetch("https://api.hyperliquid.xyz/info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "allMids" }),
        });
        const mids: Record<string, string> = await res.json();

        setPositions((prev) => {
          const toClose: { id: string; price: number; reason: ClosedTrade["closeReason"] }[] = [];
          const updated = prev.map((pos) => {
            const rawPrice = mids[pos.market];
            if (!rawPrice) return pos;
            const markPrice = parseFloat(rawPrice);

            // Check liquidation
            const liqPrice =
              pos.side === "long"
                ? pos.entryPrice * (1 - 1 / pos.leverage + 0.005)
                : pos.entryPrice * (1 + 1 / pos.leverage - 0.005);
            if (pos.side === "long" && markPrice <= liqPrice) {
              toClose.push({ id: pos.id, price: liqPrice, reason: "liquidation" });
              return pos;
            }
            if (pos.side === "short" && markPrice >= liqPrice) {
              toClose.push({ id: pos.id, price: liqPrice, reason: "liquidation" });
              return pos;
            }

            // Check stop loss
            if (pos.stopLoss !== undefined) {
              if (pos.side === "long" && markPrice <= pos.stopLoss) {
                toClose.push({ id: pos.id, price: pos.stopLoss, reason: "stop_loss" });
                return pos;
              }
              if (pos.side === "short" && markPrice >= pos.stopLoss) {
                toClose.push({ id: pos.id, price: pos.stopLoss, reason: "stop_loss" });
                return pos;
              }
            }

            // Check take profit
            if (pos.takeProfit !== undefined) {
              if (pos.side === "long" && markPrice >= pos.takeProfit) {
                toClose.push({ id: pos.id, price: pos.takeProfit, reason: "take_profit" });
                return pos;
              }
              if (pos.side === "short" && markPrice <= pos.takeProfit) {
                toClose.push({ id: pos.id, price: pos.takeProfit, reason: "take_profit" });
                return pos;
              }
            }

            // Update trailing stop
            if (pos.trailingStop) {
              let { highWaterMark, distance } = pos.trailingStop;
              let updatedPos = pos;

              if (pos.side === "long" && markPrice > highWaterMark) {
                highWaterMark = markPrice;
                updatedPos = { ...pos, trailingStop: { distance, highWaterMark } };
              } else if (pos.side === "short" && markPrice < highWaterMark) {
                highWaterMark = markPrice;
                updatedPos = { ...pos, trailingStop: { distance, highWaterMark } };
              }

              const trailTrigger =
                pos.side === "long"
                  ? highWaterMark - distance
                  : highWaterMark + distance;

              if (pos.side === "long" && markPrice <= trailTrigger) {
                toClose.push({ id: pos.id, price: trailTrigger, reason: "trailing_stop" });
                return updatedPos;
              }
              if (pos.side === "short" && markPrice >= trailTrigger) {
                toClose.push({ id: pos.id, price: trailTrigger, reason: "trailing_stop" });
                return updatedPos;
              }

              return updatedPos;
            }

            return pos;
          });

          if (toClose.length === 0) return updated;

          // Process closures
          const closedIds = new Set(toClose.map((c) => c.id));
          const remaining = updated.filter((p) => !closedIds.has(p.id));

          setHistory((h) => [
            ...toClose.map(({ id, price, reason }) => {
              const pos = updated.find((p) => p.id === id)!;
              const pnl =
                pos.side === "long"
                  ? (price - pos.entryPrice) * pos.size
                  : (pos.entryPrice - price) * pos.size;
              return { ...pos, closePrice: price, closedAt: new Date(), realizedPnl: pnl, closeReason: reason } as ClosedTrade;
            }),
            ...h,
          ]);

          return remaining;
        });
      } catch {
        // silently ignore fetch errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [positions.length]);

  return (
    <TradingContext.Provider value={{ positions, history, openPosition, closePosition, updatePosition }}>
      {children}
    </TradingContext.Provider>
  );
}

export const useTrading = () => useContext(TradingContext);
