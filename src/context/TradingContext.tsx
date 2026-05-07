"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

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
}

export interface ClosedTrade extends DemoPosition {
  closePrice: number;
  closedAt: Date;
  realizedPnl: number;
}

interface TradingCtx {
  positions: DemoPosition[];
  history: ClosedTrade[];
  openPosition: (pos: Omit<DemoPosition, "id" | "openedAt">) => void;
  closePosition: (id: string, markPrice: number) => void;
}

const TradingContext = createContext<TradingCtx>({
  positions: [],
  history: [],
  openPosition: () => {},
  closePosition: () => {},
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

  const closePosition = useCallback((id: string, markPrice: number) => {
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
      };
      setHistory((h) => [closed, ...h]);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  return (
    <TradingContext.Provider value={{ positions, history, openPosition, closePosition }}>
      {children}
    </TradingContext.Provider>
  );
}

export const useTrading = () => useContext(TradingContext);
