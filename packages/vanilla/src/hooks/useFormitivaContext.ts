/**
 * Re-exports FormContext for backward-compatibility with any code that still
 * imports from this path.  React hooks have been removed.
 */
export type { FormContext, FormContext as FormitivaContextType } from '../context/formitivaContext';
export { createDefaultContext } from '../context/formitivaContext';
export default function useFormitivaContext(): never {
  throw new Error('useFormitivaContext() is not available in the vanilla JS build. Receive context as a parameter instead.');
}
