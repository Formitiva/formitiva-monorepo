import { useContext, createContext } from 'react';
import type { FormitivaContextType } from '@formitiva/core';

// Create the context including optional validation mode
export const FormitivaContext = createContext<FormitivaContextType | undefined>(undefined);

// Hook to use the context
const useFormitivaContext = (): FormitivaContextType => {
  const context = useContext(FormitivaContext);
  if (!context) {
    throw new Error('useFormitivaContext must be used within a <FormitivaProvider>');
  }
  return context;
};

export default useFormitivaContext;