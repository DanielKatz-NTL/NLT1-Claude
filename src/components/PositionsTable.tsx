"use client";

import { useState } from "react";

type Tab = "positions" | "orders" | "history";

const TABS: { key: Tab; label: string }[] = [
  { key: "positions", label: "Positions" },
  { key: "orders", label: "Open Orders" },
  { key: "history", label: "Trade History" },
];

const POSITIONS_HEADERS = [
  "Market",
  "Side",
  "Size",
  "Entry Price",
  "Mark Price",
  "Liq. Price",
  "PnL",
  "Margin",
  "Actions",
];

const ORDERS_HEADERS = [
  "Market",
  "Side",
  "Type",
  "Size",
  "Price",
  "Filled",
  "Status",
  "Actions",
];

const HISTORY_HEADERS = [
  "Time",
  "Market",
  "Side",
  "Type",
  "Size",
  "Price",
  "Fee",
  "PnL",
];

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: "#1E2640" }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4A5170"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      </div>
      <span className="text-xs" style={{ color: "#4A5170" }}>
        No {label}
      </span>
    </div>
  );
}

export default function PositionsTable() {
  const [activeTab, setActiveTab] = useState<Tab>("positions");

  const headers =
    activeTab === "positions"
      ? POSITIONS_HEADERS
      : activeTab === "orders"
      ? ORDERS_HEADERS
      : HISTORY_HEADERS;

  const emptyLabel =
    activeTab === "positions"
      ? "open positions"
      : activeTab === "orders"
      ? "open orders"
      : "trade history";

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "#161B2E", borderTop: "1px solid #1E2640" }}
    >
      {/* Tabs */}
      <div
        className="flex items-center shrink-0"
        style={{ borderBottom: "1px solid #1E2640" }}
      >
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="px-4 py-2 text-xs font-medium transition-colors"
            style={{
              color: activeTab === key ? "#00E5CC" : "#4A5170",
              borderBottom:
                activeTab === key
                  ? "2px solid #00E5CC"
                  : "2px solid transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid #1E2640" }}>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-left font-medium whitespace-nowrap"
                  style={{ color: "#4A5170" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Empty state via a spanning row */}
            <tr>
              <td colSpan={headers.length}>
                <EmptyState label={emptyLabel} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
