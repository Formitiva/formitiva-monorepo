<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, isRef } from 'vue';
import type { Ref } from 'vue';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { isDarkTheme } from '@formitiva/core';
import type { DefinitionPropertyField } from '@formitiva/core';
import type { CSSProperties } from 'vue';

const props = defineProps<{
  position: { x: number; y: number };
  options: NonNullable<DefinitionPropertyField['options']>;
  selectedValue: string;
  // Accept either a Ref to the control element or the element itself (Options API passes $refs)
  controlRef: Ref<HTMLDivElement | null> | HTMLDivElement | null;
  theme?: string;
  formStyle?: unknown;
  fieldStyle?: unknown;
}>();

const emit = defineEmits<{
  select: [value: string];
  close: [];
}>();

const popupRef = ref<HTMLDivElement | null>(null);
const activeIndex = ref<number>(-1);
const _ctx = useFormitivaContext();
const t = computed(() => _ctx.t);

const isThemeDark = isDarkTheme(props.theme ?? 'light');

// Normalize controlRef to an actual HTMLElement when used.
const getControlEl = (): HTMLDivElement | null => {
  const cr = props.controlRef as Ref<HTMLDivElement | null> | HTMLDivElement | null;
  if (!cr) return null;
  if (isRef(cr)) return (cr.value as HTMLDivElement | null) ?? null;
  return (cr as HTMLDivElement | null) ?? null;
};

const styleFrom = (source: unknown, section?: string, key?: string): CSSProperties => {
  if (!section) return {};
  const src = source as Record<string, unknown> | undefined;
  const sec = src?.[section] as Record<string, unknown> | undefined;
  const val = key && sec ? (sec[key] as CSSProperties | undefined) : undefined;
  return (val ?? {}) as CSSProperties;
};

onMounted(() => {
  const controlEl = getControlEl();
  if (!controlEl) return;

  const form = controlEl.closest('[data-formitiva-theme]');
  const popupRoot = document.getElementById('popup-root');

  if (form && popupRoot) {
    const styles = getComputedStyle(form);
    popupRoot.style.setProperty(
      '--formitiva-secondary-bg',
      styles.getPropertyValue('--formitiva-secondary-bg')
    );
    popupRoot.style.setProperty(
      '--formitiva-text-color',
      styles.getPropertyValue('--formitiva-text-color')
    );
    popupRoot.style.setProperty(
      '--formitiva-option-menu-hover-bg',
      styles.getPropertyValue('--formitiva-option-menu-hover-bg')
    );
  }
});

const mergedPopupStyles = computed<CSSProperties>(() => ({
  maxHeight: 200,
  overflowY: "auto",
  background: "var(--formitiva-secondary-bg, #fff)",
  border: "1px solid var(--formitiva-border-color, #ccc)",
  borderRadius: 4,
  zIndex: 2000,
  boxShadow: "var(--formitiva-shadow, 0 2px 8px rgba(0,0,0,0.15))",
  pointerEvents: "auto",
  color: "var(--formitiva-text-color, #000)",
  fontSize: "var(--formitiva-popup-font-size, 0.875rem)",
  ...styleFrom(props.formStyle, 'dropdown', 'popup'),
  ...styleFrom(props.fieldStyle, undefined, 'popup'),
}));

const mergedPopupOptionStyles = computed<CSSProperties>(() => ({
  padding: "6px 8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  background: "transparent",
  color: "var(--formitiva-text-color, #000)",
  ...styleFrom(props.formStyle, 'dropdown', 'option'),
  ...styleFrom(props.fieldStyle, undefined, 'option'),
}));

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as Node;
  if (
    !popupRef.value?.contains(target) &&
    !getControlEl()?.contains(target)
  ) {
    emit('close');
  }
};

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
  
  if (props.options.length > 0) {
    const idx = props.options.findIndex(o => String(o.value) === props.selectedValue);
    nextTick(() => {
      activeIndex.value = idx >= 0 ? idx : 0;
    });
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});

watch(activeIndex, (newIdx) => {
  if (!popupRef.value || newIdx < 0) return;
  const el = popupRef.value.querySelector(`#opt-${newIdx}`) as HTMLElement | null;
  if (el) {
    nextTick(() => el.focus());
  }
});

const baseWidth = 250;
const maxHeight = 200;

const livePos = ref<{ left: number; top: number } | null>(null);
const popupWidth = ref<number | null>(null);

const updatePosition = () => {
  let left = props.position.x;
  let top = props.position.y;
  let w = baseWidth;

  const ctrl = getControlEl();
  if (ctrl) {
    const rect = ctrl.getBoundingClientRect();
    left = rect.left;
    top = rect.bottom;
    w = Math.max(80, Math.round(rect.width));
  }

  left = Math.min(left, window.innerWidth - w);
  top = Math.min(top, window.innerHeight - maxHeight);
  livePos.value = { left, top };
  popupWidth.value = w;
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (typeof globalThis === "undefined") return;

  updatePosition();
  window.addEventListener("scroll", updatePosition, true);
  window.addEventListener("resize", updatePosition);

  const observed = getControlEl();
  if (typeof ResizeObserver !== "undefined" && observed) {
    resizeObserver = new ResizeObserver(() => updatePosition());
    resizeObserver.observe(observed as Element);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", updatePosition, true);
  window.removeEventListener("resize", updatePosition);
  if (resizeObserver) {
    const el = getControlEl();
    if (el) resizeObserver.unobserve(el);
  }
});

const handleOptionKeyDown = (e: KeyboardEvent, idx: number) => {
  const len = props.options.length;
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      activeIndex.value = (activeIndex.value + 1) % len;
      break;
    case 'ArrowUp':
      e.preventDefault();
      activeIndex.value = (activeIndex.value - 1 + len) % len;
      break;
    case 'Home':
      e.preventDefault();
      activeIndex.value = 0;
      break;
    case 'End':
      e.preventDefault();
      activeIndex.value = len - 1;
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      e.stopPropagation();
      emit('select', String(props.options[idx].value));
      break;
    case 'Escape':
      e.preventDefault();
      emit('close');
      getControlEl()?.focus();
      break;
  }
};

const getOptionStyle = (idx: number) => {
  const hoverBg = isThemeDark
    ? "var(--formitiva-option-menu-hover-bg, rgba(255,255,255,0.01))"
    : "var(--formitiva-option-menu-hover-bg, #eee)";
  
  return {
    ...mergedPopupOptionStyles.value,
    background: idx === activeIndex.value ? hoverBg : mergedPopupOptionStyles.value.background,
    fontWeight: String(props.options[idx].value) === props.selectedValue ? 'bold' : 'normal',
  };
};

const handleMouseEnter = (e: MouseEvent, idx: number) => {
  (e.currentTarget as HTMLElement).style.background = isThemeDark
    ? "var(--formitiva-option-menu-hover-bg, rgba(255,255,255,0.01))"
    : "var(--formitiva-option-menu-hover-bg, #eee)";
  activeIndex.value = idx;
};

const handleMouseLeave = (e: MouseEvent, idx: number) => {
  (e.currentTarget as HTMLElement).style.background = "transparent";
  if (activeIndex.value === idx) activeIndex.value = -1;
};

const popupRoot = typeof globalThis !== 'undefined' ? (() => {
  let root = document.getElementById("popup-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "popup-root";
    document.body.appendChild(root);
  }
  return root;
})() : null;
const canTeleport = popupRoot !== null;
</script>

<template>
  <!-- Prefer teleport into popup-root, but fallback to inline rendering if unavailable -->
  <Teleport v-if="canTeleport" :to="popupRoot">
    <div
      ref="popupRef"
      role="listbox"
      :aria-activedescendant="activeIndex >= 0 ? `opt-${activeIndex}` : undefined"
      :data-formitiva-theme="theme ?? 'light'"
      style="position: fixed;"
      :style="{
        top: `${livePos?.top ?? position.y}px`,
        left: `${livePos?.left ?? position.x}px`,
        width: `${popupWidth ?? baseWidth}px`,
        ...mergedPopupStyles,
      }"
    >
      <div
        v-for="(opt, idx) in options"
        :id="`opt-${idx}`"
        :key="String(opt.value)"
        :tabindex="idx === activeIndex ? 0 : -1"
        role="option"
        :aria-selected="String(opt.value) === selectedValue"
        :style="getOptionStyle(idx)"
        @mousedown.stop="() => emit('select', String(opt.value))"
        @keydown="(e) => handleOptionKeyDown(e, idx)"
        @mouseenter="(e) => handleMouseEnter(e, idx)"
        @mouseleave="(e) => handleMouseLeave(e, idx)"
      >
        {{ t(opt.label) }}
      </div>
    </div>
  </Teleport>

  <div v-else ref="popupRef" role="listbox" :aria-activedescendant="activeIndex >= 0 ? `opt-${activeIndex}` : undefined" :data-formitiva-theme="theme ?? 'light'" :style="{ position: 'absolute', top: `${livePos?.top ?? position.y}px`, left: `${livePos?.left ?? position.x}px`, width: `${popupWidth ?? baseWidth}px`, ...mergedPopupStyles }">
    <div
      v-for="(opt, idx) in options"
      :id="`opt-${idx}`"
      :key="String(opt.value)"
      :tabindex="idx === activeIndex ? 0 : -1"
      role="option"
      :aria-selected="String(opt.value) === selectedValue"
      :style="getOptionStyle(idx)"
      @mousedown.stop="() => emit('select', String(opt.value))"
      @keydown="(e) => handleOptionKeyDown(e, idx)"
      @mouseenter="(e) => handleMouseEnter(e, idx)"
      @mouseleave="(e) => handleMouseLeave(e, idx)"
    >
      {{ t(opt.label) }}
    </div>
  </div>
</template>
