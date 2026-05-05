/**
 * App.tsx — Business Forms Portal
 *
 * Demonstrates a real-world Formitiva scenario:
 *  • Multiple business forms share a single <Formitiva> component (same interface).
 *  • A sidebar nav lists each form by its JSON schema displayName.
 *  • Selecting a form loads that schema; the component re-mounts (key prop) to reset state.
 *  • Each JSON schema carries its own submitterRef, validatorRef, and per-field visibilityRef /
 *    computedRef — all resolved from the registered plugin at runtime.
 *  • Submission results are surfaced via the submissionBridge without prop-drilling.
 */
import { useState, useEffect, useRef } from 'react';
import { Formitiva } from '@formitiva/react';
import type { FieldValidationMode } from '@formitiva/core';
import '@formitiva/core/themes/material.css';

import { schemaMap, schemaKeys } from './schemas';
import { submissionBridge } from './plugins'; // side-effect: registers BusinessFormsPlugin

// ─── Icons (inline SVG strings) ────────────────────────────────────────────────
const ICONS: Record<string, string> = {
  'customer-onboarding': '👤',
  'support-ticket':      '🎫',
  'purchase-order':      '🧾',
  'leave-request':       '📅',
};

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeKey, setActiveKey] = useState<string>(schemaKeys[0]);
  const [submitResult, setSubmitResult] = useState<{ label: string; values: unknown } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [appConfig, setAppConfig] = useState<{
    fieldValidationMode: FieldValidationMode;
    theme: 'light' | 'dark';
    language: string;
    displayInstanceName: boolean;
  }>({
    fieldValidationMode: 'onEdit',
    theme: 'light',
    language: 'en',
    displayInstanceName: false,
  });
  const settingsRef = useRef<HTMLDivElement>(null);

  const activeSchema = schemaMap[activeKey];

  // Wire the submission bridge: handlers call this when a form is submitted.
  useEffect(() => {
    submissionBridge.onSubmit = (formLabel, values) => {
      setSubmitResult({ label: formLabel, values });
    };
    return () => { submissionBridge.onSubmit = null; };
  }, []);

  // Close settings panel when clicking outside
  useEffect(() => {
    if (!showSettings) return;
    const handleClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSettings]);

  const handleNavSelect = (key: string) => {
    setActiveKey(key);
    setSubmitResult(null); // clear previous result when switching forms
  };

  return (
    <div style={s.shell}>
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside style={s.sidebar}>
        <div style={s.sidebarHeader} ref={settingsRef}>
          <div style={s.logoRow}>
            <span style={s.logoMark}>⬡</span>
            <div style={{ flex: 1 }}>
              <div style={s.sidebarTitle}>Business Portal</div>
              <div style={s.sidebarSubtitle}>@formitiva/react · real-world demo</div>
            </div>
            <button
              onClick={() => setShowSettings(v => !v)}
              title="App Settings"
              style={{
                ...s.settingsBtn,
                ...(showSettings ? s.settingsBtnActive : {}),
              }}
            >
              ⚙
            </button>
          </div>

          {showSettings && (
            <div style={s.settingsPanel}>
              <div style={s.settingsPanelTitle}>App Settings</div>

              {/* Validation Mode */}
              <div style={s.settingRow}>
                <label style={s.settingLabel}>Validation Mode</label>
                <div style={s.settingOptions}>
                  {(['onEdit', 'onBlur', 'onSubmission'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setAppConfig(c => ({ ...c, fieldValidationMode: mode }))}
                      style={{
                        ...s.optionBtn,
                        ...(appConfig.fieldValidationMode === mode ? s.optionBtnActive : {}),
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div style={s.settingRow}>
                <label style={s.settingLabel}>Theme</label>
                <div style={s.settingOptions}>
                  {(['light', 'dark'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setAppConfig(c => ({ ...c, theme: t }))}
                      style={{
                        ...s.optionBtn,
                        ...(appConfig.theme === t ? s.optionBtnActive : {}),
                      }}
                    >
                      {t === 'light' ? '☀ light' : '🌙 dark'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div style={s.settingRow}>
                <label style={s.settingLabel}>Language</label>
                <div style={s.settingOptions}>
                  {(['en', 'de', 'fr', 'es'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setAppConfig(c => ({ ...c, language: lang }))}
                      style={{
                        ...s.optionBtn,
                        ...(appConfig.language === lang ? s.optionBtnActive : {}),
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Instance Name */}
              <div style={s.settingRow}>
                <label style={s.settingLabel}>Instance Name</label>
                <button
                  onClick={() => setAppConfig(c => ({ ...c, displayInstanceName: !c.displayInstanceName }))}
                  style={{
                    ...s.optionBtn,
                    ...(appConfig.displayInstanceName ? s.optionBtnActive : {}),
                  }}
                >
                  {appConfig.displayInstanceName ? 'visible' : 'hidden'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={s.navSection}>FORMS</div>
        <nav style={s.nav}>
          {schemaKeys.map((key) => {
            const schema = schemaMap[key];
            const isActive = key === activeKey;
            return (
              <button
                key={key}
                onClick={() => handleNavSelect(key)}
                style={{ ...s.navItem, ...(isActive ? s.navItemActive : {}) }}
              >
                <span style={s.navIcon}>{ICONS[key] ?? '📄'}</span>
                <span style={s.navLabel}>{schema.displayName}</span>
              </button>
            );
          })}
        </nav>

        {/* Handler info panel */}
        <div style={s.handlerPanel}>
          <div style={s.handlerPanelTitle}>Active Handlers</div>
          <div style={s.handlerRow}>
            <span style={s.handlerBadge}>submit</span>
            <code style={s.handlerCode}>{activeSchema.submitterRef ?? '—'}</code>
          </div>
          {activeSchema.validatorRef && (
            <div style={s.handlerRow}>
              <span style={s.handlerBadge}>validate</span>
              <code style={s.handlerCode}>{activeSchema.validatorRef}</code>
            </div>
          )}
          <div style={s.handlerRow}>
            <span style={s.handlerBadge}>schema</span>
            <code style={s.handlerCode}>{activeSchema.name} v{activeSchema.version}</code>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main style={s.main}>
        <div style={s.formCard}>
          {/* Form header */}
          <div style={s.formHeader}>
            <span style={s.formIcon}>{ICONS[activeKey] ?? '📄'}</span>
            <div>
              <h2 style={s.formTitle}>{activeSchema.displayName}</h2>
              <p style={s.formDesc}>{FORM_DESCRIPTIONS[activeKey]}</p>
            </div>
          </div>

          {/*
            key={activeKey} forces a full re-mount when switching schemas,
            resetting all field values and validation state automatically.
            fieldValidationMode="onSubmission" defers validation until submit.
          */}
          <Formitiva
            key={activeKey + appConfig.fieldValidationMode + appConfig.theme + appConfig.language}
            definitionData={activeSchema}
            displayInstanceName={appConfig.displayInstanceName}
            fieldValidationMode={appConfig.fieldValidationMode}
            theme={appConfig.theme}
            language={appConfig.language}
          />

          {/* Submission result */}
          {submitResult && (
            <div>
              <div style={s.resultHeader}>
                ✅ <strong>{submitResult.label}</strong> submitted successfully
              </div>
              <div className="result-box success">
                {JSON.stringify(submitResult.values, null, 2)}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Per-form descriptions ─────────────────────────────────────────────────────

const FORM_DESCRIPTIONS: Record<string, string> = {
  'customer-onboarding':
    'Register as an individual or business. Business accounts reveal company-specific fields ' +
    '(Company Name, Tax ID, Industry) via the biz:isBusinessAccount visibility handler.',
  'support-ticket':
    'Submit a support request. Selecting "Bug Report" reveals Steps to Reproduce; ' +
    '"Bug Report" or "Feature Request" reveals Expected Behavior — both driven by visibility handlers.',
  'purchase-order':
    'Create a purchase order. Subtotal and Total Amount are computed automatically from Quantity, ' +
    'Unit Price, and Discount via the biz:calcOrderTotals computed handler.',
  'leave-request':
    'Request employee leave. Choosing "Sick Leave" shows a medical certificate checkbox; ' +
    '"Emergency Leave" reveals emergency contact fields — each via a separate visibility handler.',
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f0f2f5',
  },

  /* Sidebar */
  sidebar: {
    width: 260,
    minWidth: 260,
    background: '#1e1e2e',
    color: '#cdd6f4',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid rgba(255,255,255,0.06)',
  },
  sidebarHeader: {
    padding: '20px 18px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoMark: {
    fontSize: '1.8rem',
    color: '#cba6f7',
    lineHeight: 1,
  },
  sidebarTitle: {
    fontWeight: 700,
    fontSize: '0.95rem',
    color: '#cba6f7',
    letterSpacing: '0.01em',
  },
  sidebarSubtitle: {
    fontSize: '0.68rem',
    color: '#585b70',
    marginTop: 2,
  },
  settingsBtn: {
    background: 'none',
    border: '1px solid transparent',
    borderRadius: 6,
    color: '#585b70',
    cursor: 'pointer',
    fontSize: '1.1rem',
    lineHeight: 1,
    padding: '4px 6px',
    flexShrink: 0,
    transition: 'color 0.12s, background 0.12s',
  },
  settingsBtnActive: {
    background: 'rgba(203,166,247,0.12)',
    color: '#cba6f7',
    border: '1px solid rgba(203,166,247,0.2)',
  },
  settingsPanel: {
    marginTop: 14,
    padding: '12px 14px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.07)',
  },
  settingsPanelTitle: {
    fontSize: '0.63rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: '#45475a',
    textTransform: 'uppercase' as const,
    marginBottom: 10,
  },
  settingRow: {
    marginBottom: 10,
  },
  settingLabel: {
    display: 'block',
    fontSize: '0.7rem',
    color: '#a6adc8',
    marginBottom: 5,
    fontWeight: 500,
  },
  settingOptions: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 4,
  },
  optionBtn: {
    padding: '3px 8px',
    borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    color: '#6c7086',
    fontSize: '0.72rem',
    cursor: 'pointer',
    fontFamily: "'SFMono-Regular', Consolas, monospace",
    transition: 'background 0.1s, color 0.1s',
  },
  optionBtnActive: {
    background: 'rgba(203,166,247,0.2)',
    color: '#cba6f7',
    border: '1px solid rgba(203,166,247,0.35)',
  },

  navSection: {
    padding: '16px 18px 4px',
    fontSize: '0.66rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: '#45475a',
    textTransform: 'uppercase',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '4px 10px',
    gap: 2,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '9px 10px',
    background: 'none',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    color: '#a6adc8',
    fontSize: '0.87rem',
    textAlign: 'left',
    transition: 'background 0.12s ease, color 0.12s ease',
  },
  navItemActive: {
    background: 'rgba(203,166,247,0.12)',
    color: '#cba6f7',
  },
  navIcon: {
    fontSize: '1.05rem',
    width: 22,
    textAlign: 'center',
    flexShrink: 0,
  },
  navLabel: {
    fontWeight: 500,
  },

  /* Handler info */
  handlerPanel: {
    margin: '12px 12px 16px',
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.07)',
  },
  handlerPanelTitle: {
    fontSize: '0.66rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: '#45475a',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  handlerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  handlerBadge: {
    display: 'inline-block',
    padding: '1px 6px',
    borderRadius: 3,
    background: 'rgba(203,166,247,0.15)',
    color: '#cba6f7',
    fontSize: '0.64rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    flexShrink: 0,
  },
  handlerCode: {
    fontSize: '0.68rem',
    color: '#89dceb',
    background: 'rgba(137,220,235,0.1)',
    padding: '1px 5px',
    borderRadius: 3,
    fontFamily: "'SFMono-Regular', Consolas, monospace",
    wordBreak: 'break-all',
  },

  /* Main */
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '32px 40px',
  },
  formCard: {
    maxWidth: 680,
    background: '#fff',
    borderRadius: 12,
    padding: '28px 32px 32px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
  },
  formHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 24,
    paddingBottom: 20,
    borderBottom: '1px solid #e8eaf0',
  },
  formIcon: {
    fontSize: '2rem',
    lineHeight: 1,
    marginTop: 2,
  },
  formTitle: {
    margin: '0 0 4px',
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#111',
  },
  formDesc: {
    margin: 0,
    fontSize: '0.82rem',
    color: '#667',
    lineHeight: 1.55,
  },
  resultHeader: {
    marginTop: 20,
    marginBottom: 6,
    fontSize: '0.88rem',
    color: '#2e7d32',
  },
};
