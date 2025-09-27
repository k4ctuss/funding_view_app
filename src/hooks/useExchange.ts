import { useContext } from 'react';
import { ExchangeContext, type ExchangeContextType } from '../context/ExchangeContext';

// Hook pour utiliser le contexte (export utilitaire seulement)
export function useExchange(): ExchangeContextType {
  const context = useContext(ExchangeContext);
  if (context === null) {
    throw new Error('useExchange must be used within an ExchangeProvider');
  }
  return context;
}
