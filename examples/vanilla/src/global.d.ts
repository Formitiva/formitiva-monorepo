// Ambient type declarations for build tooling
// These provide minimal type coverage without requiring @types/node

declare module '*.css';
declare module '*.css?raw';

// Minimal process type for cross-bundler env checks
declare const process: {
  env: Record<string, string | undefined>;
} | undefined;
