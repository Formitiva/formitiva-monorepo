declare namespace React {
  type ComponentType<P = unknown> = (props: P) => unknown;
}

declare module 'react' {
  // Minimal re-export for TypeScript when React types are referenced in the codebase
  export = React;
}
