/**
 * app.component.ts — Business Forms Portal (Angular edition)
 *
 * Mirrors the react-business-portal example using Angular 17+ standalone
 * components with signals for state management.
 */
import {
  Component,
  computed,
  signal,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormitivaComponent } from '@formitiva/angular';
import type { FieldValidationMode } from '@formitiva/core';

import { schemaMap, schemaKeys } from './schemas';
import { submissionBridge } from './plugins';

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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [JsonPipe, FormitivaComponent],
  template: `
    <div class="shell">
      <!-- ── Sidebar ───────────────────────────────────────────────── -->
      <aside class="sidebar">
        <div class="sidebar-header" #settingsContainer>
          <div class="logo-row">
            <span class="logo-mark">⬡</span>
            <div class="logo-text">
              <div class="sidebar-title">Business Portal</div>
              <div class="sidebar-subtitle">&#64;formitiva/angular · real-world demo</div>
            </div>
            <button
              class="settings-btn"
              [class.active]="showSettings()"
              title="App Settings"
              (click)="$event.stopPropagation(); toggleSettings()"
            >⚙</button>
          </div>

          @if (showSettings()) {
            <div class="settings-panel">
              <div class="settings-panel-title">App Settings</div>

              <div class="setting-row">
                <label class="setting-label">Validation Mode</label>
                <div class="setting-options">
                  @for (mode of validationModes; track mode) {
                    <button
                      class="option-btn"
                      [class.active]="fieldValidationMode() === mode"
                      (click)="setSetting('fieldValidationMode', mode)"
                    >{{ mode }}</button>
                  }
                </div>
              </div>

              <div class="setting-row">
                <label class="setting-label">Theme</label>
                <div class="setting-options">
                  @for (t of themes; track t) {
                    <button
                      class="option-btn"
                      [class.active]="theme() === t"
                      (click)="setSetting('theme', t)"
                    >{{ t === 'light' ? '☀ light' : '🌙 dark' }}</button>
                  }
                </div>
              </div>

              <div class="setting-row">
                <label class="setting-label">Language</label>
                <div class="setting-options">
                  @for (lang of languages; track lang) {
                    <button
                      class="option-btn"
                      [class.active]="language() === lang"
                      (click)="setSetting('language', lang)"
                    >{{ lang }}</button>
                  }
                </div>
              </div>

              <div class="setting-row">
                <label class="setting-label">Instance Name</label>
                <button
                  class="option-btn"
                  [class.active]="displayInstanceName()"
                  (click)="toggleDisplayInstanceName()"
                >{{ displayInstanceName() ? 'visible' : 'hidden' }}</button>
              </div>
            </div>
          }
        </div>

        <div class="nav-section">FORMS</div>
        <nav class="nav">
          @for (key of schemaKeys; track key) {
            <button
              class="nav-item"
              [class.active]="key === activeKey()"
              (click)="handleNavSelect(key)"
            >
              <span class="nav-icon">{{ icons[key] ?? '📄' }}</span>
              <span class="nav-label">{{ schemaMap[key].displayName }}</span>
            </button>
          }
        </nav>

        <div class="handler-panel">
          <div class="handler-panel-title">Active Handlers</div>
          <div class="handler-row">
            <span class="handler-badge">submit</span>
            <code class="handler-code">{{ activeSchema().submitterRef ?? '—' }}</code>
          </div>
          @if (activeSchema().validatorRef) {
            <div class="handler-row">
              <span class="handler-badge">validate</span>
              <code class="handler-code">{{ activeSchema().validatorRef }}</code>
            </div>
          }
          <div class="handler-row">
            <span class="handler-badge">schema</span>
            <code class="handler-code">{{ activeSchema().name }} v{{ activeSchema().version }}</code>
          </div>
        </div>
      </aside>

      <!-- ── Main content ─────────────────────────────────────────── -->
      <main class="main">
        <div class="form-card">
          <div class="form-header">
            <span class="form-icon">{{ icons[activeKey()] ?? '📄' }}</span>
            <div>
              <h2 class="form-title">{{ activeSchema().displayName }}</h2>
              <p class="form-desc">{{ formDescriptions[activeKey()] }}</p>
            </div>
          </div>

          <!--
            @for over a single-element array keyed to switchKey() forces
            Angular to destroy and recreate <fv-formitiva> when settings change.
          -->
          @for (k of [switchKey()]; track k) {
            <fv-formitiva
              [definitionData]="activeSchema()"
              [fieldValidationMode]="fieldValidationMode()"
              [theme]="theme()"
              [language]="language()"
              [displayInstanceName]="displayInstanceName()"
            />
          }

          @if (submitResult()) {
            <div class="result-header">
              ✅ <strong>{{ submitResult()!.label }}</strong> submitted successfully
            </div>
            <pre class="result-box success">{{ submitResult()!.values | json }}</pre>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
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
  `],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('settingsContainer', { static: false }) settingsContainerRef?: ElementRef;

  // ── Exposed to template ──────────────────────────────────────────
  readonly schemaMap = schemaMap;
  readonly schemaKeys = schemaKeys;
  readonly icons = ICONS;
  readonly formDescriptions = FORM_DESCRIPTIONS;
  readonly validationModes: FieldValidationMode[] = ['onEdit', 'onBlur', 'onSubmission'];
  readonly themes = ['light', 'dark'] as const;
  readonly languages = ['en', 'de', 'fr', 'es'];

  // ── Signals ──────────────────────────────────────────────────────
  readonly activeKey             = signal<string>(schemaKeys[0]);
  readonly submitResult          = signal<{ label: string; values: unknown } | null>(null);
  readonly showSettings          = signal(false);
  readonly switchKey             = signal(0);
  readonly fieldValidationMode   = signal<FieldValidationMode>('onEdit');
  readonly theme                 = signal<'light' | 'dark'>('light');
  readonly language              = signal('en');
  readonly displayInstanceName   = signal(false);

  readonly activeSchema = computed(() => schemaMap[this.activeKey()]);

  ngOnInit(): void {
    submissionBridge.onSubmit = (formLabel, values) => {
      this.submitResult.set({ label: formLabel, values });
    };
  }

  ngOnDestroy(): void {
    submissionBridge.onSubmit = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.showSettings()) return;
    const container = this.settingsContainerRef?.nativeElement as HTMLElement | undefined;
    if (container && !container.contains(event.target as Node)) {
      this.showSettings.set(false);
    }
  }

  toggleSettings(): void {
    this.showSettings.update(v => !v);
  }

  setSetting(key: 'fieldValidationMode' | 'theme' | 'language', value: string): void {
    if (key === 'fieldValidationMode') this.fieldValidationMode.set(value as FieldValidationMode);
    else if (key === 'theme') this.theme.set(value as 'light' | 'dark');
    else if (key === 'language') this.language.set(value);
    this.submitResult.set(null);
    this.switchKey.update(k => k + 1);
  }

  toggleDisplayInstanceName(): void {
    this.displayInstanceName.update(v => !v);
    this.submitResult.set(null);
    this.switchKey.update(k => k + 1);
  }

  handleNavSelect(key: string): void {
    this.activeKey.set(key);
    this.submitResult.set(null);
  }
}
