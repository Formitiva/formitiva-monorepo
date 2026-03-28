<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import type { BaseInputProps, DefinitionPropertyField } from '@formitiva/core';
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import { useFieldValidator } from "../../../hooks/useFieldValidator";

type RatingField = DefinitionPropertyField & {
  max?: number;
  icon?: string;
};

export type RatingInputProps = BaseInputProps<number, RatingField>;

const props = defineProps<RatingInputProps>();

const emit = defineEmits<{
  change: [value: number];
  error: [error: string | null];
}>();

const _ctx = useFormitivaContext();
const t = computed(() => _ctx.t);
const validate = useFieldValidator(props.field, props.error);

const max = props.field.max ?? 5;
const iconChar = props.field.icon?.trim() || '\u2605';

const hoverIndex = ref<number | null>(null);
const starRefs = ref<Array<HTMLSpanElement | null>>([]);
const error = ref<string | null>(null);
const prevError = ref<string | null>(null);

const updateError = (next: string | null) => {
  if (next !== prevError.value) {
    prevError.value = next;
    error.value = next;
    emit('error', next);
  }
};

const ratingValue = computed(() => {
  const v = props.value ?? 0;
  return Math.min(Math.max(v, 0), max);
});

watch(ratingValue, (newVal) => {
  updateError(validate(newVal, "sync") ?? null);
});

const handleSelect = (val: number) => {
  const normalized = Math.min(Math.max(val, 0), max);
  updateError(validate(normalized, "change") ?? null);
  emit('change', normalized);
};

const handleGroupBlur = (e: FocusEvent) => {
  const currentTarget = e.currentTarget as HTMLElement;
  if (currentTarget.contains(e.relatedTarget as Node | null)) return;
  updateError(validate(ratingValue.value, "blur") ?? null);
};

const handleKeyDown = (e: KeyboardEvent, index: number) => {
  switch (e.key) {
    case "Enter":
    case " ":
      e.preventDefault();
      handleSelect(index + 1);
      break;
    case "ArrowRight":
    case "ArrowUp":
      e.preventDefault();
      starRefs.value[Math.min(max - 1, index + 1)]?.focus();
      break;
    case "ArrowLeft":
    case "ArrowDown":
      e.preventDefault();
        starRefs.value[Math.max(0, index - 1)]?.focus();
      break;
  }
};

// Handle group-level keyboard navigation (used when tests trigger keydown on radiogroup)
const handleGroupKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
    e.preventDefault();
    handleSelect(Math.min(max, ratingValue.value + 1));
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
    e.preventDefault();
    handleSelect(Math.max(0, ratingValue.value - 1));
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    // toggle first star if none selected
    if (ratingValue.value === 0) handleSelect(1);
  }
};

const getTabIndex = (index: number) => {
  if (ratingValue.value > 0) {
    return index === ratingValue.value - 1 ? 0 : -1;
  }
  return index === 0 ? 0 : -1;
};

const getStarColor = (index: number) => {
  const isActive = index < ratingValue.value;
  const isHover = hoverIndex.value !== null && index <= hoverIndex.value;
  return isHover || isActive ? "gold" : "lightgray";
};
</script>

<template>
  <StandardFieldLayout :field="field" :error="error">
    <div
      role="radiogroup"
      :aria-labelledby="`${field.name}-label`"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${field.name}-error` : undefined"
      style="display: flex; gap: 4px;"
      @blur="handleGroupBlur"
      @keydown="handleGroupKeyDown"
    >
      <span
        v-for="i in max"
        :key="i - 1"
        :ref="(el) => starRefs[i - 1] = el as HTMLSpanElement"
        role="radio"
        :tabindex="getTabIndex(i - 1)"
        :aria-checked="i - 1 < ratingValue"
        :aria-label="`Rating ${i}`"
        :title="t(`${field.displayName} ${i}`)"
        @click="handleSelect(i)"
        @keydown="(e) => handleKeyDown(e, i - 1)"
        @mouseenter="hoverIndex = i - 1"
        @mouseleave="hoverIndex = null"
        :class="[
          'formitiva-rating-star',
          { 'formitiva-rating-star--selected': (i - 1) < ratingValue },
          { 'formitiva-rating-star--hovered': hoverIndex !== null && (i - 1) <= hoverIndex }
        ]"
        style="
          cursor: pointer;
          font-size: 1.5rem;
          line-height: 1;
          display: inline-block;
          margin-right: 0.25rem;
          user-select: none;
          transition: color 0.12s ease;
        "
        :style="{ color: getStarColor(i - 1) }"
      >
        {{ iconChar }}
      </span>
    </div>
  </StandardFieldLayout>
</template>
