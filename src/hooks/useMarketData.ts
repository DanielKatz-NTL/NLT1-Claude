import useSWR from "swr";
import { getMarkets, MarketInfo } from "@/lib/hyperliquid";

export function useMarketData() {
  const { data, error, isLoading } = useSWR<MarketInfo[]>(
    "markets",
    getMarkets,
    { refreshInterval: 3000 }
  );

  return {
    markets: data ?? [],
    error,
    isLoading,
  };
}

export function useMarket(name: string) {
  const { markets, error, isLoading } = useMarketData();
  const market = markets.find((m) => m.name === name) ?? null;
  return { market, error, isLoading };
}
