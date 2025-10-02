// src/context/ExchangeContext.tsx
import type { Exchange, ExchangeConfig } from '../types/exchange'
import type { Token }  from '../types/token';
import { createContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { HyperliquidService } from '@/services/hyperliquid';
import { ParadexService } from '@/services/paradex';
import { LighterService } from '@/services/ligther';

const EXCHANGE_CONFIGS: ExchangeConfig[] = [
  {
    name: 'Hyperliquid',
    service: new HyperliquidService(),
    is_enabled: true,
    color: '#1BF287', // vert hyperliquid
  },
	{
    name: 'Paradex',
    service: new ParadexService(),
    is_enabled: true,
    color: '#111111', // vert hyperliquid
  },
	{
    name: 'Lighter',
    service: new LighterService(),
    is_enabled: true,
    color: '#111111', // vert hyperliquid
  },
  // Ajoutez d’autres exchanges ici si nécessaire
];

// État du contexte Exchange
export interface ExchangeState {
  exchanges: Exchange[];
  selectedExchangesName: string[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

// Actions du contexte Exchange
export type ExchangeAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EXCHANGES'; payload: Exchange[] }
  | { type: 'UPDATE_EXCHANGE_TOKENS'; payload: { exchangeName: string; tokens: Map<string,Token> } }
  | { type: 'TOGGLE_EXCHANGE_SELECTION'; payload: string }
  | { type: 'SET_SELECTED_EXCHANGES'; payload: string[] }
  | { type: 'UPDATE_LAST_SYNC'; payload: Date };

// Reducer pour gérer l'état
export const exchangeReducer = (state: ExchangeState, action: ExchangeAction): ExchangeState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_EXCHANGES':
      return { ...state, exchanges: action.payload, isLoading: false, error: null };

    case 'UPDATE_EXCHANGE_TOKENS':
      return {
        ...state,
        exchanges: state.exchanges.map((exchange) =>
          exchange.name === action.payload.exchangeName
            ? { ...exchange, tokens: action.payload.tokens, last_sync: new Date() }
            : exchange
        ),
      };

    case 'TOGGLE_EXCHANGE_SELECTION': {
      const isSelected = state.selectedExchangesName.includes(action.payload);
      return {
        ...state,
        selectedExchangesName: isSelected
          ? state.selectedExchangesName.filter((name) => name !== action.payload)
          : [...state.selectedExchangesName, action.payload],
      };
    }

    case 'SET_SELECTED_EXCHANGES':
      return { ...state, selectedExchangesName: action.payload };

    case 'UPDATE_LAST_SYNC':
      return { ...state, lastUpdate: action.payload };

    default:
      return state;
  }
};

// Initialisation des exchanges à partir de la config
export const initialExchanges: Exchange[] = EXCHANGE_CONFIGS.map((config) => ({
  name: config.name,
  tokens: new Map<string,Token>(),
  service: config.service,
  is_active: config.is_enabled,
  last_sync: new Date(),
  error_count: 0,
	color: config.color,
}));


// Sélection initiale: tous les exchanges actifs
const initialSelected = initialExchanges.filter((e) => e.is_active).map((e) => e.name);

// État initial
export const initialState: ExchangeState = {
  exchanges: initialExchanges,
  selectedExchangesName: initialSelected,
  isLoading: false,
  error: null,
  lastUpdate: null,
};


export interface ExchangeContextType extends ExchangeState {
  refreshExchangeData: (exchangeName: string) => Promise<void>;
  refreshAllExchanges: () => Promise<void>;
  selectExchange: (exchangeName: string) => void;
  resetSelections: () => void;
}

// Contexte uniquement (aucun composant ici)
export const ExchangeContext = createContext<ExchangeContextType | null>(null);

// Provider du contexte (export par défaut pour consistance)
export function ExchangeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(exchangeReducer, initialState);

  const refreshExchangeData = useCallback(
    async (exchangeName: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const exchange = state.exchanges.find((ex) => ex.name === exchangeName);
        if (!exchange) {
          throw new Error(`Exchange ${exchangeName} non trouvé`);
        }
        const tokens = await exchange.service.fetchTokens();
        dispatch({ type: 'UPDATE_EXCHANGE_TOKENS', payload: { exchangeName, tokens } });
      } catch (err) {
        // Préserver le message d'erreur utile
        const msg = err instanceof Error ? err.message : String(err);
        dispatch({ type: 'SET_ERROR', payload: `Erreur lors du rafraîchissement de ${exchangeName}: ${msg}` });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    []
  );

  const refreshAllExchanges = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
			
      await Promise.all(state.exchanges.map((exchange) => refreshExchangeData(exchange.name)));
      dispatch({ type: 'UPDATE_LAST_SYNC', payload: new Date() });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      dispatch({ type: 'SET_ERROR', payload: `Erreur lors du rafraîchissement des exchanges: ${msg}` });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const selectExchange = useCallback((exchangeName: string) => {
    dispatch({ type: 'TOGGLE_EXCHANGE_SELECTION', payload: exchangeName });
  }, []);

  const resetSelections = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_EXCHANGES', payload: [] });
  }, []);

  // Initialisation: rafraîchir les exchanges actifs au montage
  useEffect(() => {
    refreshAllExchanges();
  }, []);

  const value = useMemo<ExchangeContextType>(
    () => ({
      ...state,
      refreshExchangeData,
      refreshAllExchanges,
      selectExchange,
      resetSelections,
    }),
    [state, refreshExchangeData, refreshAllExchanges, selectExchange, resetSelections]
  );

	return <ExchangeContext.Provider value={value}>{children}</ExchangeContext.Provider>;

}

