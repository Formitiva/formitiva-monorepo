import type { LayoutConfig } from '@formitiva/core';

export interface NavLayoutResult {
  el: HTMLElement;
  contentEl: HTMLElement;
  destroy(): void;
}

export function createNavLayout(
  config: LayoutConfig,
  initialSection: string,
  onSectionChange: (name: string) => void,
): NavLayoutResult {
  const container = document.createElement('div');
  Object.assign(container.style, { display: 'flex', gap: '0', minHeight: '200px' });

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', config.displayName);
  Object.assign(nav.style, {
    minWidth: '160px',
    borderRight: '1px solid var(--formitiva-border, #d1d5db)',
    flexShrink: '0',
  });

  let currentSection = initialSection;
  const buttons: Map<string, HTMLButtonElement> = new Map();

  const setActive = (name: string) => {
    currentSection = name;
    buttons.forEach((btn, btnName) => {
      const isActive = btnName === name;
      btn.style.background = isActive ? 'var(--formitiva-nav-active-bg, #e8f0fe)' : 'transparent';
      btn.style.color = isActive ? 'var(--formitiva-nav-active-color, #1a73e8)' : 'var(--formitiva-text, inherit)';
      btn.style.fontWeight = isActive ? '600' : 'normal';
      btn.style.borderLeft = isActive
        ? '3px solid var(--formitiva-nav-active-color, #1a73e8)'
        : '3px solid transparent';
      btn.setAttribute('aria-current', isActive ? 'page' : '');
    });
  };

  config.sections.forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = item.label;
    Object.assign(btn.style, {
      display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px',
      border: 'none', cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit',
      lineHeight: '1.4', background: 'transparent',
    });
    btn.addEventListener('click', () => { setActive(item.name); onSectionChange(item.name); });
    buttons.set(item.name, btn);
    nav.appendChild(btn);
  });

  setActive(currentSection);

  const contentEl = document.createElement('div');
  Object.assign(contentEl.style, { flex: '1', paddingLeft: '16px', minWidth: '0' });

  container.appendChild(nav);
  container.appendChild(contentEl);

  return { el: container, contentEl, destroy() { buttons.clear(); } };
}
