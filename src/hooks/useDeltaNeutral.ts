// src/hooks/useDeltaNeutral.ts
import { useExchange } from '@/hooks/useExchange';
import { useMemo } from 'react';
import type { Token } from '@/types/token';

interface Opportunity {
  ticker: string;
  fundingSpread: number; // différence entre bestLong et bestShort
  bestLong: {
    exchange: string;
    token: Token;
  };
  bestShort: {
    exchange: string;
    token: Token;
  };
  all: {
    exchange: string;
    token: Token;
  }[];
}

export function useDeltaNeutralOpportunities(): Opportunity[] {
  const { exchanges, selectedExchangesName } = useExchange();

  const opportunities = useMemo(() => {
    const tokenMap: Record<string, { exchange: string; token: Token }[]> = {};

    for (const exchange of exchanges) {
      if (!selectedExchangesName.includes(exchange.name)) continue;

      for (const [ticker, token] of exchange.tokens.entries()) {
        const funding_rate_per_hour = token.funding_rate / token.funding_period;

        const normalizedToken: Token = {
          ...token,
          funding_rate: funding_rate_per_hour,
        };

        if (!tokenMap[ticker]) tokenMap[ticker] = [];
        tokenMap[ticker].push({ exchange: exchange.name, token: normalizedToken });
      }
    }

    const results: Opportunity[] = [];

    for (const [ticker, tokenData] of Object.entries(tokenMap)) {
      if (tokenData.length < 2) continue;

      const sorted = [...tokenData].sort((a, b) => b.token.funding_rate - a.token.funding_rate);

      const bestShort = sorted[0]; // le + haut
      const bestLong = sorted[sorted.length - 1]; // le + bas

      const spread = bestShort.token.funding_rate - bestLong.token.funding_rate;
      if (spread <= 0) continue;

      results.push({
        ticker,
        fundingSpread: spread,
        bestLong,
        bestShort,
        all: tokenData,
      });
    }

    return results.sort((a, b) => b.fundingSpread - a.fundingSpread);
  }, [exchanges, selectedExchangesName]);

  return opportunities;
}