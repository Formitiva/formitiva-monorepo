import { inject, provide, type InjectionKey } from 'vue';
import type { FormitivaContextType } from '@formitiva/core';

// Create the context injection key
export const FormitivaContextKey: InjectionKey<FormitivaContextType> = Symbol('FormitivaContext');

// Provide function for parent components
export function provideFormitivaContext(context: FormitivaContextType) {
  provide(FormitivaContextKey, context);
}

// Inject function for child components
const useFormitivaContext = (): FormitivaContextType => {
  const context = inject(FormitivaContextKey);
  if (!context) {
    throw new Error('useFormitivaContext must be used within a FormitivaProvider');
  }
  return context;
};

export default useFormitivaContext;