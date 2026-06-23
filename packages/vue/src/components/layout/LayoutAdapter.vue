<script setup lang="ts">
import type { LayoutConfig } from '@formitiva/core';
import useFormitivaContext from '../../hooks/useFormitivaContext';
import NavLayout from './NavLayout.vue';
import TabLayout from './TabLayout.vue';
import WizardLayout from './WizardLayout.vue';

defineProps<{
  layout: LayoutConfig;
  modelValue: string;
  nextDisabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [section: string];
}>();

const context = useFormitivaContext();
const t = context.t;

</script>

<template>
  <!-- Nav layout -->
  <template v-if="layout.type === 'nav'">
    <NavLayout
      :config="layout"
      :active-section="modelValue"
      :on-section-change="(name: string) => emit('update:modelValue', name)"
    >
      <slot :renderArea="true" />
    </NavLayout>
    <slot name="submit" />
  </template>

  <!-- Tab layout -->
  <template v-else-if="layout.type === 'tab'">
    <TabLayout
      :config="layout"
      :active-section="modelValue"
      :on-section-change="(name: string) => emit('update:modelValue', name)"
    >
      <slot :renderArea="true" />
    </TabLayout>
    <slot name="submit" />
  </template>

  <!-- Wizard layout -->
  <template v-else-if="layout.type === 'wizard'">
    <WizardLayout
      :config="layout"
      :active-section="modelValue"
      :next-disabled="nextDisabled ?? false"
      :on-section-change="(name: string) => emit('update:modelValue', name)"
      :t="t"
    >
      <slot :renderArea="true" />
      <template #submit>
        <slot name="submit" />
      </template>
    </WizardLayout>
  </template>
</template>
