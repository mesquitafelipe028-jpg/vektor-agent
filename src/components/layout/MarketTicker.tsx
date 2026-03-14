import { useEffect, useRef } from "react";
import { useStockQuotes } from "@/hooks/useStockQuotes";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

const DEFAULT_TICKERS = [
  "USD-BRL",
  "EUR-BRL",
  "PETR4",
  "VALE3",
  "ITUB4",
  "HGLG11",
  "bitcoin",
  "ethereum",
];

const LABEL_MAP: Record<string, string> = {
  "USD-BRL": "USD/BRL",
  "EUR-BRL": "EUR/BRL",
  bitcoin: "BTC",
  ethereum: "ETH",
};

const REFRESH_INTERVAL = 5 * 60 * 1000;

export function MarketTicker() {
  const { quotes, isLoading, fetchQuotes } = useStockQuotes();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchQuotes(DEFAULT_TICKERS);
      hasFetched.current = true;
    }
    const id = setInterval(() => fetchQuotes(DEFAULT_TICKERS), REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchQuotes]);

  const entries = Object.entries(quotes).filter(
    ([, q]) => q != null && typeof q.price === "number"
  );
  const hasData = entries.length > 0;

  if (!isLoading && !hasData) return null;

  return (
    <div className="h-8 sm:h-8 bg-card border-b border-border overflow-hidden relative select-none">
      {isLoading && !hasData ? (
        <div className="flex items-center gap-6 px-4 h-full">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-24 rounded" />
          ))}
        </div>
      ) : (
        <div className="flex items-center h-full animate-marquee whitespace-nowrap">
          {[...entries, ...entries].map(([ticker, q], i) => {
            const label = LABEL_MAP[ticker] || ticker;
            const isPositive = q.change >= 0;
            return (
              <span
                key={`${ticker}-${i}`}
                className="inline-flex items-center gap-1.5 px-4 text-xs sm:text-sm font-medium"
              >
                <span className="text-muted-foreground font-heading">{label}</span>
                <span className="text-foreground tabular-nums">
                  {q.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`inline-flex items-center gap-0.5 tabular-nums ${isPositive ? "text-success" : "text-destructive"}`}>
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {isPositive ? "+" : ""}
                  {q.change.toFixed(2)}%
                </span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
