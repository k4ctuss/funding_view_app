import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { TradingPair } from '../types/exchange';
import type { Token } from '../types/token';

// État du contexte Trading
interface TradingState {
  tradingPairs: TradingPair[];
  isLoading: boolean;
  error: string | null;
  sortBy: 'net_funding_rate' | 'opportunity_score' | 'volume_score';
  sortOrder: 'asc' | 'desc';
  minVolumeThreshold: number;
  minOpenInterestThreshold: number;
}

// Actions du contexte Trading
type TradingAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TRADING_PAIRS'; payload: TradingPair[] }
  | { type: 'SET_SORT_BY'; payload: 'net_funding_rate' | 'opportunity_score' | 'volume_score' }
  | { type: 'SET_SORT_ORDER'; payload: 'asc' | 'desc' }
  | { type: 'SET_MIN_VOLUME_THRESHOLD'; payload: number }
  | { type: 'SET_MIN_OPEN_INTEREST_THRESHOLD'; payload: number };

// Reducer pour gérer l'état
const tradingReducer = (state: TradingState, action: TradingAction): TradingState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_TRADING_PAIRS':
      return { ...state, tradingPairs: action.payload, isLoading: false, error: null };
    
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };
    
    case 'SET_SORT_ORDER':
      return { ...state, sortOrder: action.payload };
    
    case 'SET_MIN_VOLUME_THRESHOLD':
      return { ...state, minVolumeThreshold: action.payload };
    
    case 'SET_MIN_OPEN_INTEREST_THRESHOLD':
      return { ...state, minOpenInterestThreshold: action.payload };
    
    default:
      return state;
  }
};

// État initial
const initialState: TradingState = {
  tradingPairs: [],
  isLoading: false,
  error: null,
  sortBy: 'net_funding_rate',
  sortOrder: 'desc',
  minVolumeThreshold: 0, // Volume minimum en USD
  minOpenInterestThreshold: 0 // Open Interest minimum en USD
};

// Création du contexte
const TradingContext = createContext<{
  state: TradingState;
  dispatch: React.Dispatch<TradingAction>;
  //calculateTradingPairs: () => void;
  getFilteredAndSortedPairs: () => TradingPair[];
  getTradingRecommendation: (pair: TradingPair) => {
    action: 'LONG' | 'SHORT';
    exchange: string;
    reason: string;
    expectedReturn: number;
  };
} | null>(null);

// Provider du contexte
export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tradingReducer, initialState);

  // Fonction pour calculer les paires de trading


  // Fonction pour obtenir les paires filtrées et triées
  const getFilteredAndSortedPairs = (): TradingPair[] => {
    return state.tradingPairs
      .filter(pair => 
        pair.volume_score >= state.minVolumeThreshold &&
        // Note: On pourrait ajouter une vérification d'open interest si nécessaire
        true
      )
      .sort((a, b) => {
        const aValue = a[state.sortBy];
        const bValue = b[state.sortBy];
        
        if (state.sortOrder === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
  };

  // Fonction pour obtenir une recommandation de trading
  const getTradingRecommendation = (pair: TradingPair): {
    action: 'LONG' | 'SHORT';
    exchange: string;
    reason: string;
    expectedReturn: number;
  } => {
    const isPositiveFunding = pair.net_funding_rate > 0;
    
    return {
      action: isPositiveFunding ? 'LONG' : 'SHORT',
      exchange: isPositiveFunding ? pair.long_exchange : pair.short_exchange,
      reason: isPositiveFunding 
        ? `Long sur ${pair.long_exchange} (funding: ${(pair.long_funding_rate * 100).toFixed(4)}%) et Short sur ${pair.short_exchange} (funding: ${(pair.short_funding_rate * 100).toFixed(4)}%)`
        : `Short sur ${pair.short_exchange} (funding: ${(pair.short_funding_rate * 100).toFixed(4)}%) et Long sur ${pair.long_exchange} (funding: ${(pair.long_funding_rate * 100).toFixed(4)}%)`,
      expectedReturn: Math.abs(pair.net_funding_rate) * 100 // En pourcentage
    };
  };


  return (
    <TradingContext.Provider value={{
      state,
      dispatch,
      //calculateTradingPairs,
      getFilteredAndSortedPairs,
      getTradingRecommendation
    }}>
      {children}
    </TradingContext.Provider>
  );
};

// Hook pour utiliser le contexte
export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
