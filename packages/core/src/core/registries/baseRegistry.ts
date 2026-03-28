export class BaseRegistry<T> {
  private map: Record<string, T> = {};

  register(name: string, value: T): void {
    if (!name || typeof name !== 'string') {
      throw new Error('Registry key must be a non-empty string');
    }
    this.map[name] = value;
  }

  get(name: string): T | undefined {
    if (!name || typeof name !== 'string') return undefined;
    return this.map[name];
  }

  has(name: string): boolean {
    if (!name || typeof name !== 'string') return false;
    return name in this.map;
  }

  list(): string[] {
    return Object.keys(this.map);
  }

  entries(): [string, T][] {
    return Object.entries(this.map);
  }

  values(): T[] {
    return Object.values(this.map);
  }

  size(): number {
    return Object.keys(this.map).length;
  }

  unregister(name: string): boolean {
    if (name in this.map) {
      delete this.map[name];
      return true;
    }
    return false;
  }

  clear(): void {
    this.map = {};
  }

  registerAll(entries: Record<string, T> | [string, T][]): void {
    if (Array.isArray(entries)) {
      entries.forEach(([name, value]) => {
        if (name && typeof name === 'string') {
          this.register(name, value);
        }
      });
    } else if (entries && typeof entries === 'object') {
      Object.entries(entries).forEach(([name, value]) => {
        if (name && typeof name === 'string') {
          this.register(name, value);
        }
      });
    }
  }

  getOrDefault(name: string, defaultValue: T): T {
    const value = this.get(name);
    return value !== undefined ? value : defaultValue;
  }
}

export default BaseRegistry;
