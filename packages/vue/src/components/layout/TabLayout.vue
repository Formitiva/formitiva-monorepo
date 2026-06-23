<script setup lang="ts">
import type { LayoutConfig } from '@formitiva/core';

defineProps<{
  config: LayoutConfig;
  activeSection: string;
  onSectionChange: (name: string) => void;
}>();
</script>

<template>
  <div>
    <!-- Tab bar -->
    <div
      role="tablist"
      :aria-label="config.displayName"
      style="display: flex; border-bottom: 2px solid var(--formitiva-border, #d1d5db); margin-bottom: 16px; gap: 0;"
    >
      <button
        v-for="item in config.sections"
        :key="item.name"
        type="button"
        role="tab"
        :aria-selected="item.name === activeSection"
        :style="{
          padding: '8px 20px',
          background: 'transparent',
          border: 'none',
          borderBottom: item.name === activeSection
            ? '2px solid var(--formitiva-tab-active-color, #1a73e8)'
            : '2px solid transparent',
          marginBottom: '-2px',
          color: item.name === activeSection
            ? 'var(--formitiva-tab-active-color, #1a73e8)'
            : 'var(--formitiva-text, inherit)',
          fontWeight: item.name === activeSection ? '600' : 'normal',
          cursor: 'pointer',
          fontSize: 'inherit',
          fontFamily: 'inherit',
        }"
        @click="onSectionChange(item.name)"
      >
        {{ item.label }}
      </button>
    </div>

    <!-- Tab panel content -->
    <div role="tabpanel">
      <slot />
    </div>
  </div>
</template>
