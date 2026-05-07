'use client';

import { useState } from "react";
import Header from "@/components/Header";
import MarketSelector from "@/components/MarketSelector";
import MarketStats from "@/components/MarketStats";
import TradingChart from "@/components/TradingChart";
import OrderBook from "@/components/OrderBook";
import TradePanel from "@/components/TradePanel";
import PositionsTable from "@/components/PositionsTable";

export default function TradingPage() {
  const [selectedMarket, setSelectedMarket] = useState("BTC");

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: "#0D0E14", color: "#E8EAF0" }}
    >
      {/* Top header bar */}
      <Header />

      {/* Main content — fills remaining height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — market list */}
        <MarketSelector
          selectedMarket={selectedMarket}
          onSelect={setSelectedMarket}
        />

        {/* Center + right columns */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Market stats bar */}
          <MarketStats market={selectedMarket} />

          {/* Middle row: chart + order book + trade panel */}
          <div className="flex flex-1 overflow-hidden">
            {/* Chart — takes most of the space */}
            <div className="flex-1 overflow-hidden">
              <TradingChart market={selectedMarket} />
            </div>

            {/* Order book */}
            <div
              className="shrink-0 overflow-hidden"
              style={{ width: 220 }}
            >
              <OrderBook market={selectedMarket} />
            </div>

            {/* Trade panel */}
            <div
              className="shrink-0 overflow-hidden"
              style={{ width: 240 }}
            >
              <TradePanel market={selectedMarket} />
            </div>
          </div>

          {/* Bottom — positions / orders / history */}
          <div
            className="shrink-0 overflow-hidden"
            style={{ height: 200 }}
          >
            <PositionsTable />
          </div>
        </div>
      </div>
    </div>
  );
}
