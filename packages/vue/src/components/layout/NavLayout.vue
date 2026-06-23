<script setup lang="ts">
import type { LayoutConfig } from '@formitiva/core';

defineProps<{
  config: LayoutConfig;
  activeSection: string;
  onSectionChange: (name: string) => void;
}>();
</script>

<template>
  <div style="display: flex; gap: 0; min-height: 200px;">
    <!-- Left nav panel -->
    <nav
      :aria-label="config.displayName"
      style="min-width: 160px; border-right: 1px solid var(--formitiva-border, #d1d5db); flex-shrink: 0;"
    >
      <button
        v-for="item in config.sections"
        :key="item.name"
        type="button"
        :aria-current="item.name === activeSection ? 'page' : undefined"
        :style="{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          padding: '10px 16px',
          background: item.name === activeSection ? 'var(--formitiva-nav-active-bg, #e8f0fe)' : 'transparent',
          color: item.name === activeSection ? 'var(--formitiva-nav-active-color, #1a73e8)' : 'var(--formitiva-text, inherit)',
          fontWeight: item.name === activeSection ? '600' : 'normal',
          border: 'none',
          borderLeft: item.name === activeSection ? '3px solid var(--formitiva-nav-active-color, #1a73e8)' : '3px solid transparent',
          cursor: 'pointer',
          fontSize: 'inherit',
          fontFamily: 'inherit',
          lineHeight: '1.4',
        }"
        @click="onSectionChange(item.name)"
      >
        {{ item.label }}
      </button>
    </nav>

    <!-- Right content area -->
    <div style="flex: 1; padding-left: 16px; min-width: 0;">
      <slot />
    </div>
  </div>
</template>
