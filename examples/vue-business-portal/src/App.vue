<script setup lang="ts">
/**
 * App.vue — Business Forms Portal (Vue 3 edition)
 *
 * Mirrors the react-business-portal example using Vue 3 Composition API.
 * Same business logic, same plugin system, same settings panel.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Formitiva } from '@formitiva/vue';
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

// ─── State ────────────────────────────────────────────────────────────────────
const activeKey   = ref<string>(schemaKeys[0]);
const submitResult = ref<{ label: string; values: unknown } | null>(null);
const showSettings = ref(false);
const switchKey   = ref(0); // incrementing this forces <Formitiva> to remount

const fieldValidationMode = ref<FieldValidationMode>('onEdit');
const theme    = ref<'light' | 'dark'>('light');
const language = ref('en');
const displayInstanceName = ref(false);

const activeSchema = computed(() => schemaMap[activeKey.value]);
const formKey      = computed(
  () => `${activeKey.value}-${switchKey.value}-${fieldValidationMode.value}-${theme.value}-${language.value}`,
);

// ─── Navigation ───────────────────────────────────────────────────────────────
function handleNavSelect(key: string) {
  activeKey.value    = key;
  submitResult.value = null;
}

function updateSetting<K extends 'fieldValidationMode' | 'theme' | 'language' | 'displayInstanceName'>(
  key: K,
  value: K extends 'fieldValidationMode' ? FieldValidationMode
       : K extends 'theme' ? 'light' | 'dark'
       : K extends 'language' ? string
       : boolean,
) {
  if (key === 'fieldValidationMode') fieldValidationMode.value = value as FieldValidationMode;
  else if (key === 'theme') theme.value = value as 'light' | 'dark';
  else if (key === 'language') language.value = value as string;
  else if (key === 'displayInstanceName') displayInstanceName.value = value as boolean;
  switchKey.value += 1;
}

// ─── Settings panel click-outside ─────────────────────────────────────────────
const settingsContainerRef = ref<HTMLElement | null>(null);

function handleDocClick(e: MouseEvent) {
  if (!showSettings.value) return;
  if (settingsContainerRef.value && !settingsContainerRef.value.contains(e.target as Node)) {
    showSettings.value = false;
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleDocClick);
  submissionBridge.onSubmit = (formLabel, values) => {
    submitResult.value = { label: formLabel, values };
  };
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleDocClick);
  submissionBridge.onSubmit = null;
});
</script>

<template>
  <div class="shell">
    <!-- ── Sidebar ─────────────────────────────────────────────────── -->
    <aside class="sidebar">
      <div class="sidebar-header" ref="settingsContainerRef">
        <div class="logo-row">
          <span class="logo-mark">⬡</span>
          <div class="logo-text">
            <div class="sidebar-title">Business Portal</div>
            <div class="sidebar-subtitle">@formitiva/vue · real-world demo</div>
          </div>
          <button
            class="settings-btn"
            :class="{ active: showSettings }"
            title="App Settings"
            @click.stop="showSettings = !showSettings"
          >⚙</button>
        </div>

        <!-- Settings panel -->
        <div v-if="showSettings" class="settings-panel">
          <div class="settings-panel-title">App Settings</div>

          <div class="setting-row">
            <label class="setting-label">Validation Mode</label>
            <div class="setting-options">
              <button
                v-for="mode in (['onEdit', 'onBlur', 'onSubmission'] as const)"
                :key="mode"
                class="option-btn"
                :class="{ active: fieldValidationMode === mode }"
                @click="updateSetting('fieldValidationMode', mode)"
              >{{ mode }}</button>
            </div>
          </div>

          <div class="setting-row">
            <label class="setting-label">Theme</label>
            <div class="setting-options">
              <button
                v-for="t in (['light', 'dark'] as const)"
                :key="t"
                class="option-btn"
                :class="{ active: theme === t }"
                @click="updateSetting('theme', t)"
              >{{ t === 'light' ? '☀ light' : '🌙 dark' }}</button>
            </div>
          </div>

          <div class="setting-row">
            <label class="setting-label">Language</label>
            <div class="setting-options">
              <button
                v-for="lang in ['en', 'de', 'fr', 'es']"
                :key="lang"
                class="option-btn"
                :class="{ active: language === lang }"
                @click="updateSetting('language', lang)"
              >{{ lang }}</button>
            </div>
          </div>

          <div class="setting-row">
            <label class="setting-label">Instance Name</label>
            <button
              class="option-btn"
              :class="{ active: displayInstanceName }"
              @click="updateSetting('displayInstanceName', !displayInstanceName)"
            >{{ displayInstanceName ? 'visible' : 'hidden' }}</button>
          </div>
        </div>
      </div>

      <div class="nav-section">FORMS</div>
      <nav class="nav">
        <button
          v-for="key in schemaKeys"
          :key="key"
          class="nav-item"
          :class="{ active: key === activeKey }"
          @click="handleNavSelect(key)"
        >
          <span class="nav-icon">{{ ICONS[key] ?? '📄' }}</span>
          <span class="nav-label">{{ schemaMap[key].displayName }}</span>
        </button>
      </nav>

      <!-- Handler panel -->
      <div class="handler-panel">
        <div class="handler-panel-title">Active Handlers</div>
        <div class="handler-row">
          <span class="handler-badge">submit</span>
          <code class="handler-code">{{ activeSchema.submitterRef ?? '—' }}</code>
        </div>
        <div v-if="activeSchema.validatorRef" class="handler-row">
          <span class="handler-badge">validate</span>
          <code class="handler-code">{{ activeSchema.validatorRef }}</code>
        </div>
        <div class="handler-row">
          <span class="handler-badge">schema</span>
          <code class="handler-code">{{ activeSchema.name }} v{{ activeSchema.version }}</code>
        </div>
      </div>
    </aside>

    <!-- ── Main content ─────────────────────────────────────────────── -->
    <main class="main">
      <div class="form-card">
        <div class="form-header">
          <span class="form-icon">{{ ICONS[activeKey] ?? '📄' }}</span>
          <div>
            <h2 class="form-title">{{ activeSchema.displayName }}</h2>
            <p class="form-desc">{{ FORM_DESCRIPTIONS[activeKey] }}</p>
          </div>
        </div>

        <Formitiva
          :key="formKey"
          :definition-data="activeSchema"
          :field-validation-mode="fieldValidationMode"
          :theme="theme"
          :language="language"
          :display-instance-name="displayInstanceName"
        />

        <div v-if="submitResult">
          <div class="result-header">
            ✅ <strong>{{ submitResult.label }}</strong> submitted successfully
          </div>
          <pre class="result-box success">{{ JSON.stringify(submitResult.values, null, 2) }}</pre>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  min-height: 100vh;
  background: #f0f2f5;
}

/* ── Sidebar ─────────────────────────────────────────────── */
.sidebar {
  width: 260px;
  min-width: 260px;
  background: #1e1e2e;
  color: #cdd6f4;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255,255,255,0.06);
}

.sidebar-header {
  padding: 20px 18px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  position: relative;
}

.logo-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-mark {
  font-size: 1.8rem;
  color: #cba6f7;
  line-height: 1;
}

.logo-text { flex: 1; }

.sidebar-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #cba6f7;
  letter-spacing: 0.01em;
}

.sidebar-subtitle {
  font-size: 0.68rem;
  color: #585b70;
  margin-top: 2px;
}

.settings-btn {
  background: none;
  border: 1px solid transparent;
  border-radius: 6px;
  color: #585b70;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  padding: 4px 6px;
  flex-shrink: 0;
  transition: color 0.12s, background 0.12s;
}
.settings-btn.active {
  background: rgba(203,166,247,0.12);
  color: #cba6f7;
  border-color: rgba(203,166,247,0.2);
}

.settings-panel {
  margin-top: 14px;
  padding: 12px 14px;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.07);
}

.settings-panel-title {
  font-size: 0.63rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #45475a;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.setting-row { margin-bottom: 10px; }

.setting-label {
  display: block;
  font-size: 0.7rem;
  color: #a6adc8;
  margin-bottom: 5px;
  font-weight: 500;
}

.setting-options {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.option-btn {
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: #6c7086;
  font-size: 0.72rem;
  cursor: pointer;
  font-family: 'SFMono-Regular', Consolas, monospace;
  transition: background 0.1s, color 0.1s;
}
.option-btn.active {
  background: rgba(203,166,247,0.2);
  color: #cba6f7;
  border-color: rgba(203,166,247,0.35);
}

.nav-section {
  padding: 16px 18px 4px;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #45475a;
  text-transform: uppercase;
}

.nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 4px 10px;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 9px 10px;
  border-radius: 8px;
  border: none;
  background: none;
  color: #a6adc8;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.12s, color 0.12s;
}
.nav-item:hover  { background: rgba(255,255,255,0.05); color: #cdd6f4; }
.nav-item.active { background: rgba(203,166,247,0.15); color: #cba6f7; }

.nav-icon { font-size: 1.1rem; flex-shrink: 0; }
.nav-label { flex: 1; }

/* Handler panel */
.handler-panel {
  margin: 12px 12px 16px;
  padding: 12px 14px;
  background: rgba(255,255,255,0.04);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.07);
}

.handler-panel-title {
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #45475a;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.handler-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 5px;
  flex-wrap: wrap;
}

.handler-badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  background: rgba(203,166,247,0.15);
  color: #cba6f7;
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  flex-shrink: 0;
  margin-top: 1px;
  text-transform: uppercase;
}

.handler-code {
  font-size: 0.68rem;
  color: #89dceb;
  background: rgba(137,220,235,0.1);
  padding: 1px 5px;
  border-radius: 3px;
  word-break: break-all;
  font-family: 'SFMono-Regular', Consolas, monospace;
}

/* ── Main ─────────────────────────────────────────────── */
.main {
  flex: 1;
  padding: 32px 40px;
  overflow-y: auto;
}

.form-card {
  max-width: 680px;
  margin: 0;
  background: #fff;
  border-radius: 12px;
  padding: 28px 32px 32px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06);
}

.form-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.form-icon { font-size: 2rem; flex-shrink: 0; }

.form-title {
  margin: 0 0 4px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
}

.form-desc {
  margin: 0;
  font-size: 0.83rem;
  color: #6b7280;
  line-height: 1.5;
}

.result-header {
  margin-top: 24px;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #15803d;
}

.result-box {
  margin: 0;
  padding: 16px 20px;
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 8px;
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 320px;
  overflow-y: auto;
  line-height: 1.5;
}
.result-box.success { border-left: 4px solid #a6e3a1; }
</style>
