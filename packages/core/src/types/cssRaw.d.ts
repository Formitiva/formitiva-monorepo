/**
 * Allows importing CSS files as raw strings using Vite's `?raw` import.
 *
 * Example:
 *   import cssText from './formitiva.css?raw';
 *
 * This declaration tells TypeScript that `*.css?raw` imports resolve to a
 * `string` so the compiler and editors (IntelliSense) treat them correctly.
 */
declare module '*.css?raw' {
  const content: string;
  export default content;
}
