/**
 * router.ts — Simple hash-based router for the vanilla demo app.
 */

type PageRenderer = (container: HTMLElement) => void | Promise<void>;
type NavigateCallback = (path: string, render: PageRenderer) => void | Promise<void>;

const pages: Record<string, () => Promise<{ default: PageRenderer }>> = {
  'basic':            () => import('./pages/home'),
  'groups':           () => import('./pages/groups'),
  'parents':          () => import('./pages/parents'),
  'validation':       () => import('./pages/validation'),
  'submit-handler':   () => import('./pages/submitHandler'),
  'translation':      () => import('./pages/translation'),
  'custom-component': () => import('./pages/customComponent'),
  'plugin':           () => import('./pages/plugin'),
};

class Router {
  private cb: NavigateCallback | null = null;

  onNavigate(callback: NavigateCallback) {
    this.cb = callback;
  }

  async navigate(path: string) {
    window.location.hash = path;
    await this._load(path);
  }

  private async _load(path: string) {
    const loader = pages[path] ?? pages['basic'];
    const mod = await loader();
    this.cb?.(path, mod.default);
  }

  start() {
    window.addEventListener('hashchange', () => {
      const path = window.location.hash.replace('#', '') || 'basic';
      this._load(path);
    });
    const initial = window.location.hash.replace('#', '') || 'basic';
    this._load(initial);
  }
}

export const router = new Router();
