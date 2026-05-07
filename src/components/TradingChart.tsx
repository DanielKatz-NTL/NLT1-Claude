"use client";

import { useEffect, useRef, useState } from "react";
import { getCandles, Candle } from "@/lib/hyperliquid";

interface Props {
  market: string;
}

const INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1d"];

export default function TradingChart({ market }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candleSeriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const volumeSeriesRef = useRef<any>(null);
  const [interval, setInterval] = useState("15m");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize chart
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    let chart: unknown;

    import("lightweight-charts").then(({ createChart, CrosshairMode }) => {
      if (!containerRef.current) return;

      chart = createChart(containerRef.current, {
        layout: {
          background: { color: "#0A0A0A" },
          textColor: "#8A8070",
        },
        grid: {
          vertLines: { color: "#2A2A2A" },
          horzLines: { color: "#2A2A2A" },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { color: "#383838", labelBackgroundColor: "#141414" },
          horzLine: { color: "#383838", labelBackgroundColor: "#141414" },
        },
        rightPriceScale: {
          borderColor: "#2A2A2A",
          textColor: "#8A8070",
        },
        timeScale: {
          borderColor: "#2A2A2A",
          timeVisible: true,
          secondsVisible: false,
        },
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const candleSeries = (chart as any).addCandlestickSeries({
        upColor: "#00C853",
        downColor: "#FF4466",
        borderUpColor: "#00C853",
        borderDownColor: "#FF4466",
        wickUpColor: "#00C853",
        wickDownColor: "#FF4466",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const volumeSeries = (chart as any).addHistogramSeries({
        color: "#D4A017",
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
        scaleMargins: { top: 0.85, bottom: 0 },
      });

      chartRef.current = chart;
      candleSeriesRef.current = candleSeries;
      volumeSeriesRef.current = volumeSeries;

      // Handle resize
      const resizeObserver = new ResizeObserver(() => {
        if (containerRef.current && chart) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (chart as any).applyOptions({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
          });
        }
      });
      resizeObserver.observe(containerRef.current);

      return () => resizeObserver.disconnect();
    });

    return () => {
      if (chart) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (chart as any).remove();
      }
    };
  }, []);

  // Load candle data
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

    setIsLoading(true);
    const endTime = Date.now();
    const startTime = endTime - 200 * intervalToMs(interval);

    getCandles(market, interval, startTime, endTime)
      .then((candles: Candle[]) => {
        if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

        const candleData = candles.map((c) => ({
          time: Math.floor(c.t / 1000) as unknown as import("lightweight-charts").Time,
          open: parseFloat(c.o),
          high: parseFloat(c.h),
          low: parseFloat(c.l),
          close: parseFloat(c.c),
        }));

        const volumeData = candles.map((c) => ({
          time: Math.floor(c.t / 1000) as unknown as import("lightweight-charts").Time,
          value: parseFloat(c.v),
          color: parseFloat(c.c) >= parseFloat(c.o) ? "rgba(0,200,83,0.3)" : "rgba(255,68,102,0.3)",
        }));

        candleSeriesRef.current.setData(candleData);
        volumeSeriesRef.current.setData(volumeData);

        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [market, interval]);

  return (
    <div className="flex flex-col h-full" style={{ background: "#0A0A0A" }}>
      {/* Interval selector */}
      <div
        className="flex items-center gap-0 px-3 py-1 border-b shrink-0"
        style={{ borderColor: "#2A2A2A" }}
      >
        {INTERVALS.map((iv) => (
          <button
            key={iv}
            onClick={() => setInterval(iv)}
            className="px-2.5 py-1 text-xs rounded transition-colors"
            style={{
              color: iv === interval ? "#D4A017" : "#8A8070",
              background: iv === interval ? "rgba(212,160,23,0.1)" : "transparent",
            }}
          >
            {iv}
          </button>
        ))}
        {isLoading && (
          <span className="ml-2 text-xs" style={{ color: "#4A4540" }}>Loading...</span>
        )}
      </div>

      {/* Chart container */}
      <div ref={containerRef} className="flex-1 w-full" />
    </div>
  );
}

function intervalToMs(interval: string): number {
  const map: Record<string, number> = {
    "1m": 60_000,
    "5m": 300_000,
    "15m": 900_000,
    "1h": 3_600_000,
    "4h": 14_400_000,
    "1d": 86_400_000,
  };
  return map[interval] ?? 900_000;
}
