<script setup lang="ts">
import { computed } from 'vue';
import type { LayoutConfig } from '@formitiva/core';

const props = defineProps<{
  config: LayoutConfig;
  activeSection: string;
  nextDisabled?: boolean;
  onSectionChange: (name: string) => void;
  t: (key: string) => string;
}>();

const steps = computed(() => props.config.sections);
const currentIndex = computed(() => steps.value.findIndex((s) => s.name === props.activeSection));
const isFirst = computed(() => currentIndex.value === 0);
const isLast = computed(() => currentIndex.value === steps.value.length - 1);
const nextDisabled = computed(() => isLast.value || Boolean(props.nextDisabled));

const goNext = () => {
  if (!nextDisabled.value) props.onSectionChange(steps.value[currentIndex.value + 1].name);
};

const goPrev = () => {
  if (!isFirst.value) props.onSectionChange(steps.value[currentIndex.value - 1].name);
};
</script>

<template>
  <div>
    <div style="display: flex; align-items: center; margin-bottom: 20px; gap: 0;" :aria-label="config.displayName">
      <template v-for="(step, index) in steps" :key="step.name">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <div
            :style="{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8em',
              fontWeight: '600',
              background: index < currentIndex
                ? 'var(--formitiva-wizard-done-bg, #34a853)'
                : step.name === activeSection
                  ? 'var(--formitiva-wizard-active-bg, #1a73e8)'
                  : 'var(--formitiva-wizard-inactive-bg, #e0e0e0)',
              color: index < currentIndex || step.name === activeSection ? '#fff' : 'var(--formitiva-text-muted, #666)',
            }"
          >
            {{ index < currentIndex ? '\u2713' : index + 1 }}
          </div>
          <span
            :style="{
              fontSize: '0.75em',
              color: step.name === activeSection
                ? 'var(--formitiva-wizard-active-color, #1a73e8)'
                : 'var(--formitiva-text-muted, #666)',
              fontWeight: step.name === activeSection ? '600' : 'normal',
              whiteSpace: 'nowrap',
            }"
          >
            {{ step.label }}
          </span>
        </div>
        <div
          v-if="index < steps.length - 1"
          :style="{
            flex: '1',
            height: '2px',
            background: index < currentIndex
              ? 'var(--formitiva-wizard-done-bg, #34a853)'
              : 'var(--formitiva-border, #d1d5db)',
            margin: '0 4px',
            marginBottom: '20px',
          }"
        />
      </template>
    </div>

    <div style="margin-bottom: 16px;">
      <slot />
    </div>

    <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:16px;">
      <div>
        <slot name="submit" />
      </div>
      <div style="display:flex; gap:8px;">
        <button type="button" class="formitiva-button" style="width: 100px;" :disabled="isFirst" @click="goPrev">
          {{ t('Previous') }}
        </button>
        <button type="button" class="formitiva-button" style="width: 100px;" :disabled="nextDisabled" @click="goNext">
          {{ t('Next') }}
        </button>
      </div>
    </div>
  </div>
</template>
