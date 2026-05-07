import useSWR from "swr";
import { getOrderBook, L2Book } from "@/lib/hyperliquid";

export function useOrderBook(coin: string) {
  const { data, error, isLoading } = useSWR<L2Book>(
    `orderbook-${coin}`,
    () => getOrderBook(coin),
    { refreshInterval: 2000 }
  );

  return {
    orderBook: data ?? null,
    error,
    isLoading,
  };
}
