import type { LayoutConfig } from '@formitiva/core';

export interface TabLayoutResult {
  el: HTMLElement;
  contentEl: HTMLElement;
  destroy(): void;
}

export function createTabLayout(
  config: LayoutConfig,
  initialSection: string,
  onSectionChange: (name: string) => void,
): TabLayoutResult {
  const container = document.createElement('div');

  const tabBar = document.createElement('div');
  tabBar.setAttribute('role', 'tablist');
  tabBar.setAttribute('aria-label', config.displayName);
  Object.assign(tabBar.style, {
    display: 'flex',
    borderBottom: '2px solid var(--formitiva-border, #d1d5db)',
    marginBottom: '16px',
    gap: '0',
  });

  let currentSection = initialSection;
  const buttons: Map<string, HTMLButtonElement> = new Map();

  const setActive = (name: string) => {
    currentSection = name;
    buttons.forEach((btn, btnName) => {
      const isActive = btnName === name;
      btn.style.borderBottom = isActive
        ? '2px solid var(--formitiva-tab-active-color, #1a73e8)'
        : '2px solid transparent';
      btn.style.color = isActive
        ? 'var(--formitiva-tab-active-color, #1a73e8)'
        : 'var(--formitiva-text, inherit)';
      btn.style.fontWeight = isActive ? '600' : 'normal';
      btn.setAttribute('aria-selected', String(isActive));
    });
  };

  config.sections.forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.textContent = item.label;
    Object.assign(btn.style, {
      padding: '8px 20px', background: 'transparent', border: 'none',
      marginBottom: '-2px', cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit',
    });
    btn.addEventListener('click', () => { setActive(item.name); onSectionChange(item.name); });
    buttons.set(item.name, btn);
    tabBar.appendChild(btn);
  });

  setActive(currentSection);

  const contentEl = document.createElement('div');
  contentEl.setAttribute('role', 'tabpanel');

  container.appendChild(tabBar);
  container.appendChild(contentEl);

  return { el: container, contentEl, destroy() { buttons.clear(); } };
}
