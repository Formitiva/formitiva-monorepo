/**
 * Vanilla JS Tooltip component.
 * Replaces Tooltip.tsx (React + ReactDOM.createPortal).
 */
import { isDarkTheme, isDarkColor } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';

const QUESTION_MARK_SVG = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
  <line x1="12" y1="17" x2="12.01" y2="17"/>
</svg>`;

let _tooltipCounter = 0;

export interface TooltipResult {
  el: HTMLElement; // the icon span
  destroy(): void;
}

export function createTooltip(
  content: string,
  ctx: FormContext,
  size: 'small' | 'medium' | 'large' = 'medium',
  animation = true
): TooltipResult {
  const tooltipId = `formitiva-tooltip-${++_tooltipCounter}`;
  const isThemeDark = isDarkTheme(ctx.theme);

  // Size config
  const sizeConfig = {
    small: { padding: '4px 8px', fontSize: '11px', maxWidth: '200px' },
    medium: { padding: '6px 10px', fontSize: '12px', maxWidth: '240px' },
    large: { padding: '8px 12px', fontSize: '13px', maxWidth: '280px' },
  };
  const sc = sizeConfig[size];

  // Icon element
  const icon = document.createElement('span');
  icon.dataset.testid = 'tooltip-icon';
  icon.setAttribute('role', 'button');
  icon.setAttribute('tabindex', '0');
  icon.innerHTML = QUESTION_MARK_SVG;
  Object.assign(icon.style, {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.2em',
    height: '1.2em',
    fontSize: '0.9em',
    fontWeight: 'bold',
    borderRadius: '50%',
    backgroundColor: isThemeDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    color: `var(--formitiva-text-color, ${isThemeDark ? '#f0f0f0' : '#333'})`,
    border: `1px solid ${isThemeDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
    cursor: 'pointer',
    marginLeft: '0.3em',
    transition: animation ? 'all 0.2s ease' : '',
    flexShrink: '0',
  });

  // Compute icon background using CSS color-mix if supported
  requestAnimationFrame(() => {
    const styles = getComputedStyle(icon);
    const primaryBg = styles.getPropertyValue('--formitiva-primary-bg').trim();
    if (primaryBg && typeof CSS !== 'undefined' && CSS.supports?.('color: color-mix(in srgb, red, blue)')) {
      const baseColor = isDarkColor(primaryBg) ? 'black' : 'white';
      icon.style.backgroundColor = `color-mix(in srgb, var(--formitiva-primary-bg) 85%, ${baseColor} 15%)`;
    }
  });

  // Tooltip float div
  const tip = document.createElement('div');
  tip.id = tooltipId;
  tip.setAttribute('role', 'tooltip');
  Object.assign(tip.style, {
    position: 'fixed',
    padding: sc.padding,
    fontSize: sc.fontSize,
    maxWidth: sc.maxWidth,
    width: '240px',
    backgroundColor: `var(--formitiva-tooltip-color-bg, ${isThemeDark ? 'rgba(45,45,45,0.95)' : 'rgba(34,10,170,0.92)'})`,
    color: `var(--formitiva-tooltip-color, ${isThemeDark ? '#f0f0f0' : '#fff'})`,
    borderRadius: '6px',
    border: `1px solid ${isThemeDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
    boxShadow: isThemeDark ? '0 8px 16px rgba(0,0,0,0.4)' : '0 6px 18px rgba(0,0,0,0.12)',
    zIndex: '2147483647',
    opacity: '0',
    pointerEvents: 'none',
    transition: animation ? 'opacity 120ms ease, transform 120ms ease' : '',
    transform: 'translateY(-4px) scale(0.98)',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    boxSizing: 'border-box',
    top: '0',
    left: '0',
  });
  tip.textContent = ctx.t(content);

  let removeTimeout: ReturnType<typeof setTimeout> | null = null;

  const getPopupRoot = () => document.getElementById('popup-root') ?? document.body;

  function updateTipCssVars() {
    const form = icon.closest('[data-formitiva-theme]');
    const popupRoot = getPopupRoot();
    if (form && popupRoot) {
      const sts = getComputedStyle(form);
      popupRoot.style.setProperty('--formitiva-tooltip-color-bg', sts.getPropertyValue('--formitiva-tooltip-color-bg'));
      popupRoot.style.setProperty('--formitiva-tooltip-color', sts.getPropertyValue('--formitiva-tooltip-color'));
    }
  }

  function showTip() {
    const popupRoot = getPopupRoot();
    popupRoot.appendChild(tip);
    updateTipCssVars();

    // Measure + position
    requestAnimationFrame(() => {
      const iconRect = icon.getBoundingClientRect();
      const tipRect = tip.getBoundingClientRect();
      const margin = 8;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const verticalNudge = -4;

      let x = iconRect.right + margin;
      let y = iconRect.top + iconRect.height / 2 - tipRect.height / 2 + verticalNudge;

      if (x + tipRect.width > vw - margin) {
        x = iconRect.left - margin - tipRect.width;
      }
      x = Math.max(margin, Math.min(x, vw - tipRect.width - margin));
      y = Math.max(margin, Math.min(y, vh - tipRect.height - margin));

      tip.style.top = `${y}px`;
      tip.style.left = `${x}px`;
      tip.style.opacity = '1';
      tip.style.transform = 'translateY(0) scale(1)';
      tip.style.pointerEvents = 'auto';
    });

    icon.setAttribute('aria-describedby', tooltipId);
  }

  function hideTip() {
    tip.style.opacity = '0';
    tip.style.transform = 'translateY(-4px) scale(0.98)';
    tip.style.pointerEvents = 'none';
    icon.removeAttribute('aria-describedby');
    // Remove after transition
    const delay = animation ? 120 : 0;
    removeTimeout = setTimeout(() => { tip.remove(); removeTimeout = null; }, delay);
  }

  icon.addEventListener('mouseenter', showTip);
  icon.addEventListener('mouseleave', hideTip);
  icon.addEventListener('focus', showTip);
  icon.addEventListener('blur', hideTip);

  return {
    el: icon,
    destroy() {
      if (removeTimeout !== null) { clearTimeout(removeTimeout); removeTimeout = null; }
      icon.removeEventListener('mouseenter', showTip);
      icon.removeEventListener('mouseleave', hideTip);
      icon.removeEventListener('focus', showTip);
      icon.removeEventListener('blur', hideTip);
      tip.remove();
    },
  };
}

export default createTooltip;
