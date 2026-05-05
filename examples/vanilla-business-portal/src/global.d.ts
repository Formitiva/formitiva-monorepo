// Ambient type declarations for build tooling
declare module '*.css';
declare module '*.css?raw';

declare const process: {
  env: Record<string, string | undefined>;
} | undefined;
