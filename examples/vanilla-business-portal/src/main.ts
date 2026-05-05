/**
 * main.ts — Business Forms Portal (Vanilla JS edition)
 *
 * Mirrors the react-business-portal example using @formitiva/vanilla.
 * All rendering is manual DOM manipulation; the Formitiva instance
 * mounts/unmounts into a dedicated container.
 */
import './styles.css';
import '@formitiva/core/themes/material.css';
import { Formitiva } from '@formitiva/vanilla';
import type { FieldValidationMode } from '@formitiva/core';

import { schemaMap, schemaKeys } from './schemas';
import { submissionBridge } from './plugins';

// ─── Icons ────────────────────────────────────────────────────────────────────
const ICONS: Record<string, string> = {
  'customer-onboarding': '👤',
  'support-ticket':      '🎫',
  'purchase-order':      '🧾',
  'leave-request':       '📅',
};

const FORM_DESCRIPTIONS: Record<string, string> = {
  'customer-onboarding':
    'Register as individual or business. Business accounts reveal company-specific fields via the biz:isBusinessAccount visibility handler.',
  'support-ticket':
    'Submit a support request. "Bug Report" reveals Steps to Reproduce; "Bug Report" or "Feature Request" reveals Expected Behavior.',
  'purchase-order':
    'Create a purchase order. Subtotal and Total are computed automatically from Quantity, Unit Price, and Discount.',
  'leave-request':
    'Request employee leave. "Sick Leave" shows a medical certificate checkbox; "Emergency Leave" reveals emergency contact fields.',
};

// ─── App State ────────────────────────────────────────────────────────────────
let activeKey   = schemaKeys[0];
let currentForm: Formitiva | null = null;
let showSettings = false;
let submitResult: { label: string; values: unknown } | null = null;

let fieldValidationMode: FieldValidationMode = 'onEdit';
let theme: 'light' | 'dark' = 'light';
let language = 'en';
let displayInstanceName = false;

// ─── Submission bridge ────────────────────────────────────────────────────────
submissionBridge.onSubmit = (formLabel, values) => {
  submitResult = { label: formLabel, values };
  renderSubmitResult();
};

// ─── DOM helpers ──────────────────────────────────────────────────────────────
function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, html?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls)  e.className   = cls;
  if (html) e.innerHTML   = html;
  return e;
}

function $(sel: string): HTMLElement | null {
  return document.querySelector(sel);
}

// ─── Mount / Unmount Formitiva ────────────────────────────────────────────────
async function mountForm(): Promise<void> {
  if (currentForm) {
    currentForm.unmount();
    currentForm = null;
  }
  const container = $('#form-mount') as HTMLElement;
  if (!container) return;
  container.innerHTML = '';

  const schema = schemaMap[activeKey];
  currentForm = new Formitiva({
    definitionData: schema,
    fieldValidationMode,
    theme,
    language,
    displayInstanceName,
  });
  await currentForm.mount(container);
}

// ─── Render helpers ───────────────────────────────────────────────────────────
function renderNav(): void {
  const nav = $('#nav') as HTMLElement;
  if (!nav) return;
  nav.innerHTML = '';
  schemaKeys.forEach(key => {
    const schema = schemaMap[key];
    const btn = el('button', `nav-item${key === activeKey ? ' active' : ''}`);
    btn.innerHTML = `<span class="nav-icon">${ICONS[key] ?? '📄'}</span><span class="nav-label">${schema.displayName}</span>`;
    btn.addEventListener('click', () => handleNavSelect(key));
    nav.appendChild(btn);
  });
}

function renderHandlerPanel(): void {
  const panel = $('#handler-panel') as HTMLElement;
  if (!panel) return;
  const schema = schemaMap[activeKey];
  panel.innerHTML = `
    <div class="handler-panel-title">Active Handlers</div>
    <div class="handler-row">
      <span class="handler-badge">submit</span>
      <code class="handler-code">${schema.submitterRef ?? '—'}</code>
    </div>
    ${schema.validatorRef ? `
    <div class="handler-row">
      <span class="handler-badge">validate</span>
      <code class="handler-code">${schema.validatorRef}</code>
    </div>` : ''}
    <div class="handler-row">
      <span class="handler-badge">schema</span>
      <code class="handler-code">${schema.name} v${schema.version}</code>
    </div>
  `;
}

function renderFormHeader(): void {
  const header = $('#form-header') as HTMLElement;
  if (!header) return;
  const schema = schemaMap[activeKey];
  header.innerHTML = `
    <span class="form-icon">${ICONS[activeKey] ?? '📄'}</span>
    <div>
      <h2 class="form-title">${schema.displayName}</h2>
      <p class="form-desc">${FORM_DESCRIPTIONS[activeKey]}</p>
    </div>
  `;
}

function renderSubmitResult(): void {
  let box = $('#result-box') as HTMLElement;
  if (!box) {
    box = el('div');
    box.id = 'result-box';
    ($('#form-card') as HTMLElement)?.appendChild(box);
  }
  if (!submitResult) { box.innerHTML = ''; return; }
  box.innerHTML = `
    <div class="result-header">✅ <strong>${submitResult.label}</strong> submitted successfully</div>
    <pre class="result-box success">${JSON.stringify(submitResult.values, null, 2)}</pre>
  `;
}

function renderSettings(): void {
  const existing = $('#settings-panel');
  if (!showSettings) { existing?.remove(); return; }
  if (existing) return; // already rendered

  const panel = el('div', 'settings-panel');
  panel.id = 'settings-panel';

  const modes: FieldValidationMode[] = ['onEdit', 'onBlur', 'onSubmission'];
  const themes = ['light', 'dark'] as const;
  const langs  = ['en', 'de', 'fr', 'es'];

  function makeOptions<T extends string>(
    values: readonly T[],
    current: () => T,
    onSelect: (v: T) => void,
  ): string {
    return values.map(v => `
      <button class="option-btn${current() === v ? ' active' : ''}" data-val="${v}">${v}</button>
    `).join('');
  }

  panel.innerHTML = `
    <div class="settings-panel-title">App Settings</div>

    <div class="setting-row">
      <label class="setting-label">Validation Mode</label>
      <div class="setting-options" id="so-validation">
        ${modes.map(m => `<button class="option-btn${fieldValidationMode === m ? ' active' : ''}">${m}</button>`).join('')}
      </div>
    </div>

    <div class="setting-row">
      <label class="setting-label">Theme</label>
      <div class="setting-options" id="so-theme">
        ${themes.map(t => `<button class="option-btn${theme === t ? ' active' : ''}">${t === 'light' ? '☀ light' : '🌙 dark'}</button>`).join('')}
      </div>
    </div>

    <div class="setting-row">
      <label class="setting-label">Language</label>
      <div class="setting-options" id="so-lang">
        ${langs.map(l => `<button class="option-btn${language === l ? ' active' : ''}">${l}</button>`).join('')}
      </div>
    </div>

    <div class="setting-row">
      <label class="setting-label">Instance Name</label>
      <div class="setting-options" id="so-instance">
        <button class="option-btn${displayInstanceName ? ' active' : ''}">${displayInstanceName ? 'visible' : 'hidden'}</button>
      </div>
    </div>
  `;

  // Wire validation mode buttons
  panel.querySelector('#so-validation')!.querySelectorAll('button').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      fieldValidationMode = modes[i];
      rerenderSettings();
      remountFormWithSettings();
    });
  });

  // Wire theme buttons
  panel.querySelector('#so-theme')!.querySelectorAll('button').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      theme = themes[i];
      rerenderSettings();
      remountFormWithSettings();
    });
  });

  // Wire lang buttons
  panel.querySelector('#so-lang')!.querySelectorAll('button').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      language = langs[i];
      rerenderSettings();
      remountFormWithSettings();
    });
  });

  // Wire instance name button
  panel.querySelector('#so-instance')!.querySelector('button')!.addEventListener('click', () => {
    displayInstanceName = !displayInstanceName;
    rerenderSettings();
    remountFormWithSettings();
  });

  ($('#sidebar-header') as HTMLElement)?.appendChild(panel);
}

function rerenderSettings(): void {
  $('#settings-panel')?.remove();
  if (showSettings) renderSettings();
}

async function remountFormWithSettings(): Promise<void> {
  submitResult = null;
  renderSubmitResult();
  await mountForm();
}

// ─── Navigation ───────────────────────────────────────────────────────────────
async function handleNavSelect(key: string): Promise<void> {
  activeKey    = key;
  submitResult = null;
  renderNav();
  renderHandlerPanel();
  renderFormHeader();
  renderSubmitResult();
  await mountForm();
}

// ─── Build shell HTML ─────────────────────────────────────────────────────────
function buildShell(root: HTMLElement): void {
  root.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="sidebar-header" id="sidebar-header">
          <div class="logo-row">
            <span class="logo-mark">⬡</span>
            <div class="logo-text">
              <div class="sidebar-title">Business Portal</div>
              <div class="sidebar-subtitle">@formitiva/vanilla · real-world demo</div>
            </div>
            <button class="settings-btn" id="settings-toggle-btn" title="App Settings">⚙</button>
          </div>
        </div>
        <div class="nav-section">FORMS</div>
        <nav class="nav" id="nav"></nav>
        <div class="handler-panel" id="handler-panel"></div>
      </aside>

      <main class="main">
        <div class="form-card" id="form-card">
          <div class="form-header" id="form-header"></div>
          <div id="form-mount"></div>
        </div>
      </main>
    </div>
  `;

  // Settings toggle button
  const settingsBtn = document.getElementById('settings-toggle-btn')!;
  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showSettings = !showSettings;
    settingsBtn.classList.toggle('active', showSettings);
    renderSettings();
  });

  // Click outside to close settings
  document.addEventListener('mousedown', (e) => {
    if (!showSettings) return;
    const header = document.getElementById('sidebar-header');
    if (header && !header.contains(e.target as Node)) {
      showSettings = false;
      settingsBtn.classList.remove('active');
      $('#settings-panel')?.remove();
    }
  });
}

// ─── CSS styles (injected) ────────────────────────────────────────────────────
function injectStyles(): void {
  const style = document.createElement('style');
  style.textContent = `
    .shell { display: flex; min-height: 100vh; background: #f0f2f5; }

    /* Sidebar */
    .sidebar { width: 260px; min-width: 260px; background: #1e1e2e; color: #cdd6f4;
      display: flex; flex-direction: column; border-right: 1px solid rgba(255,255,255,0.06); }
    .sidebar-header { padding: 20px 18px 16px; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .logo-row { display: flex; align-items: center; gap: 12px; }
    .logo-mark { font-size: 1.8rem; color: #cba6f7; line-height: 1; }
    .logo-text { flex: 1; }
    .sidebar-title { font-weight: 700; font-size: 0.95rem; color: #cba6f7; letter-spacing: 0.01em; }
    .sidebar-subtitle { font-size: 0.68rem; color: #585b70; margin-top: 2px; }
    .settings-btn { background: none; border: 1px solid transparent; border-radius: 6px;
      color: #585b70; cursor: pointer; font-size: 1.1rem; line-height: 1; padding: 4px 6px;
      flex-shrink: 0; transition: color 0.12s, background 0.12s; }
    .settings-btn.active { background: rgba(203,166,247,0.12); color: #cba6f7;
      border-color: rgba(203,166,247,0.2); }
    .settings-panel { margin-top: 14px; padding: 12px 14px; background: rgba(0,0,0,0.2);
      border-radius: 8px; border: 1px solid rgba(255,255,255,0.07); }
    .settings-panel-title { font-size: 0.63rem; font-weight: 700; letter-spacing: 0.1em;
      color: #45475a; text-transform: uppercase; margin-bottom: 10px; }
    .setting-row { margin-bottom: 10px; }
    .setting-label { display: block; font-size: 0.7rem; color: #a6adc8; margin-bottom: 5px; font-weight: 500; }
    .setting-options { display: flex; flex-wrap: wrap; gap: 4px; }
    .option-btn { padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.04); color: #6c7086; font-size: 0.72rem; cursor: pointer;
      font-family: 'SFMono-Regular', Consolas, monospace; transition: background 0.1s, color 0.1s; }
    .option-btn.active { background: rgba(203,166,247,0.2); color: #cba6f7;
      border-color: rgba(203,166,247,0.35); }
    .nav-section { padding: 16px 18px 4px; font-size: 0.66rem; font-weight: 700;
      letter-spacing: 0.1em; color: #45475a; text-transform: uppercase; }
    .nav { flex: 1; display: flex; flex-direction: column; padding: 4px 10px; gap: 2px; }
    .nav-item { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left;
      padding: 9px 10px; border-radius: 8px; border: none; background: none; color: #a6adc8;
      cursor: pointer; font-size: 0.875rem; font-weight: 500; transition: background 0.12s, color 0.12s; }
    .nav-item:hover { background: rgba(255,255,255,0.05); color: #cdd6f4; }
    .nav-item.active { background: rgba(203,166,247,0.15); color: #cba6f7; }
    .nav-icon { font-size: 1.1rem; flex-shrink: 0; }
    .nav-label { flex: 1; }
    .handler-panel { margin: 12px 12px 16px; padding: 12px 14px; background: rgba(255,255,255,0.04);
      border-radius: 8px; border: 1px solid rgba(255,255,255,0.07); }
    .handler-panel-title { font-size: 0.66rem; font-weight: 700; letter-spacing: 0.1em;
      color: #45475a; text-transform: uppercase; margin-bottom: 8px; }
    .handler-row { display: flex; align-items: flex-start; gap: 6px; margin-bottom: 5px; flex-wrap: wrap; }
    .handler-badge { display: inline-block; padding: 1px 6px; border-radius: 3px;
      background: rgba(203,166,247,0.15); color: #cba6f7; font-size: 0.64rem; font-weight: 700;
      letter-spacing: 0.05em; flex-shrink: 0; margin-top: 1px; text-transform: uppercase; }
    .handler-code { font-size: 0.68rem; color: #89dceb; background: rgba(137,220,235,0.1);
      padding: 1px 5px; border-radius: 3px; word-break: break-all;
      font-family: 'SFMono-Regular', Consolas, monospace; }

    /* Main */
    .main { flex: 1; padding: 32px 40px; overflow-y: auto; }
    .form-card { max-width: 680px; margin: 0; background: #fff; border-radius: 12px;
      padding: 28px 32px 32px; box-shadow: 0 1px 4px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06); }
    .form-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 28px;
      padding-bottom: 20px; border-bottom: 1px solid #f0f0f0; }
    .form-icon { font-size: 2rem; flex-shrink: 0; }
    .form-title { margin: 0 0 4px; font-size: 1.25rem; font-weight: 700; color: #1a1a2e; }
    .form-desc { margin: 0; font-size: 0.83rem; color: #6b7280; line-height: 1.5; }
    .result-header { margin-top: 24px; margin-bottom: 8px; font-size: 0.9rem; color: #15803d; }
    .result-box { margin: 0; padding: 16px 20px; background: #1e1e2e; color: #cdd6f4;
      border-radius: 8px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.8rem;
      white-space: pre-wrap; word-break: break-all; max-height: 320px; overflow-y: auto; line-height: 1.5; }
    .result-box.success { border-left: 4px solid #a6e3a1; }
  `;
  document.head.appendChild(style);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init(): Promise<void> {
  injectStyles();
  const root = document.getElementById('app')!;
  buildShell(root);
  renderNav();
  renderHandlerPanel();
  renderFormHeader();
  await mountForm();
}

init();
