/**
 * Vanilla JS PopupOptionMenu.
 * Replaces PopupOptionMenu.tsx (React + ReactDOM.createPortal).
 */

export type PopupOptionMenuPosition = {
  x: number;
  y: number;
};

export interface PopupOption {
  label: string;
}

export interface PopupOptionMenuResult {
  el: HTMLElement;
  destroy(): void;
}

export function createPopupOptionMenu<T extends PopupOption>(
  pos: PopupOptionMenuPosition,
  options: T[],
  onClose: () => void,
  onClickOption: (option: T) => void
): PopupOptionMenuResult | null {
  if (!options || options.length === 0) return null;
  if (pos.x == null || pos.y == null) return null;

  const popupRoot = (typeof document !== 'undefined')
    ? (document.getElementById('popup-root') ?? document.body)
    : null;
  if (!popupRoot) return null;

  let isSelecting = false;

  const menu = document.createElement('div');
  Object.assign(menu.style, {
    position: 'fixed',
    top: `${pos.y}px`,
    left: `${pos.x}px`,
    visibility: 'hidden',
    backgroundColor: 'var(--formitiva-primary-bg, #fff)',
    border: '1px solid var(--formitiva-border-color, #ccc)',
    borderRadius: 'var(--formitiva-border-radius, 4px)',
    boxShadow: 'var(--formitiva-shadow, 0 2px 10px rgba(0,0,0,0.2))',
    zIndex: '9999',
    minWidth: 'var(--formitiva-menu-min-width, 150px)',
    maxHeight: 'var(--formitiva-menu-max-height, 300px)',
    overflowY: 'auto',
    pointerEvents: 'auto',
  });

  options.forEach((option) => {
    const item = document.createElement('div');
    item.dataset.popupMenu = 'item';
    item.textContent = option.label;
    Object.assign(item.style, {
      padding: '8px 12px',
      cursor: 'pointer',
      fontSize: '14px',
      color: 'var(--formitiva-text-color, #333)',
    });
    item.addEventListener('mouseenter', () => {
      item.style.backgroundColor = 'var(--formitiva-hover-bg, rgba(0,0,0,0.06))';
    });
    item.addEventListener('mouseleave', () => {
      item.style.backgroundColor = '';
    });
    item.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      isSelecting = true;
    });
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      destroy();
      onClose();
      onClickOption(option);
      isSelecting = false;
    });
    menu.appendChild(item);
  });

  menu.addEventListener('mousedown', (e) => e.stopPropagation());

  popupRoot.appendChild(menu);

  // Adjust position to avoid viewport overflow
  requestAnimationFrame(() => {
    const menuRect = menu.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = pos.x;
    let top = pos.y;

    if (left + menuRect.width > vw) {
      left = Math.max(0, vw - menuRect.width - 10);
    }
    if (top + menuRect.height > vh) {
      top = Math.max(0, pos.y - menuRect.height - 5);
    }

    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.visibility = 'visible';
  });

  let destroyed = false;
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    document.removeEventListener('mousedown', handleClickOutside);
    menu.remove();
  }

  function handleClickOutside(event: MouseEvent) {
    if (isSelecting) return;
    const target = event.target as HTMLElement;
    if (target.dataset?.popupMenu === 'item') return;
    if (menu.contains(event.target as Node)) return;
    destroy();
    onClose();
  }

  document.addEventListener('mousedown', handleClickOutside);

  return {
    el: menu,
    destroy,
  };
}
