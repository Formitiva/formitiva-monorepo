<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { nextTick } from 'vue';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { isDarkTheme, isDarkColor } from '@formitiva/core';
import type { CSSProperties } from 'vue';


type TooltipProps = {
  content: string;
  size?: "small" | "medium" | "large";
  animation?: boolean;
};

const props = withDefaults(defineProps<TooltipProps>(), {
  size: 'medium',
  animation: true
});

const _ctx = useFormitivaContext();
const t = computed(() => _ctx.t);
const theme = _ctx.theme;
const formStyle = _ctx.formStyle;
const fieldStyle = _ctx.fieldStyle;
const hover = ref(false);
const pos = ref({ x: 0, y: 0 });
const positioned = ref(false);
const iconRef = ref<HTMLSpanElement | null>(null);
const tooltipRef = ref<HTMLDivElement | null>(null);
const iconRectRef = ref<DOMRect | null>(null);
const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
const isThemeDark = isDarkTheme(theme ?? 'light');

const iconBg = ref<string | undefined>(undefined);

onMounted(() => {
  if (!iconRef.value) return;
  const fallback = "rgba(255,255,255,0.1)";
  const styles = getComputedStyle(iconRef.value);
  const primaryBg = styles.getPropertyValue('--formitiva-primary-bg').trim();

  if (primaryBg && typeof CSS !== "undefined" && CSS.supports?.("color: color-mix(in srgb, red, blue)")) {
    const baseColor = isDarkColor(primaryBg) ? "black" : "white";
    iconBg.value = `color-mix(in srgb, var(--formitiva-primary-bg) 85%, ${baseColor} 15%)`;
  } else {
    iconBg.value = fallback;
  }
});

const tooltipStyles = computed(() => {
  const sizeConfig: Record<string, CSSProperties> = {
    small: { padding: "4px 8px", fontSize: "11px", maxWidth: "200px" },
    medium: { padding: "6px 10px", fontSize: "12px", maxWidth: "240px" },
    large: { padding: "8px 12px", fontSize: "13px", maxWidth: "280px" },
  };

  const base: { icon: CSSProperties; text: CSSProperties; textVisible: CSSProperties } = {
    icon: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "1.2em",
      height: "1.2em",
      fontSize: "0.9em",
      fontWeight: "bold",
      borderRadius: "50%",
      backgroundColor: iconBg.value ?? (isThemeDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
      color: `var(--formitiva-text-color, ${isThemeDark ? "#f0f0f0" : "#333"})`,
      border: `1px solid ${isThemeDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}`,
      cursor: "pointer",
      transition: props.animation ? "all 0.2s ease" : undefined,
      marginLeft: "0.3em",
    },
    text: {
      ...sizeConfig[props.size],
      position: "fixed",
      backgroundColor: `var(--formitiva-tooltip-color-bg, ${isThemeDark ? "rgba(45,45,45,0.95)" : "rgba(34, 10, 170, 0.92)"})`,
      color: `var(--formitiva-tooltip-color, ${isThemeDark ? "#f0f0f0" : "#fff"})`,
      borderRadius: "6px",
      border: `1px solid ${isThemeDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
      boxShadow: isThemeDark
        ? "0 8px 16px rgba(0,0,0,0.4)"
        : "0 6px 18px rgba(0,0,0,0.12)",
      zIndex: 2147483647,
      opacity: 0,
      pointerEvents: "none",
      transition: props.animation ? "opacity 0.2s ease" : undefined,
      whiteSpace: "normal",
      wordBreak: "break-word",
      boxSizing: "border-box",
    },
    textVisible: {
      opacity: 1,
      pointerEvents: "auto",
    },
  };

  const styleFrom = (source: unknown, section?: string, key?: string): CSSProperties => {
    if (!section) return {} as CSSProperties;
    const src = source as Record<string, unknown> | undefined;
    const sec = src?.[section] as Record<string, unknown> | undefined;
    const val = key && sec ? (sec[key] as CSSProperties | undefined) : undefined;
    return (val ?? {}) as CSSProperties;
  };

  const merged = {
    icon: { ...base.icon, ...styleFrom(formStyle, 'tooltip', 'icon'), ...styleFrom(fieldStyle, 'tooltip', 'icon') },
    text: { ...base.text, ...styleFrom(formStyle, 'tooltip', 'text'), ...styleFrom(fieldStyle, 'tooltip', 'text') },
    textVisible: base.textVisible,
  };

  return merged;
});

const computePosition = () => {
  if (!iconRef.value || !tooltipRef.value) return false;

  const iconRect = iconRef.value.getBoundingClientRect();
  iconRectRef.value = iconRect;
  const tooltipRect = tooltipRef.value.getBoundingClientRect();
  // If tooltip has no size yet, measurement is not ready.
  if (!tooltipRect || tooltipRect.width === 0 || tooltipRect.height === 0) return false;
  const margin = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const verticalNudge = -4;

  let x = iconRect.right + margin;
  let y = iconRect.top + iconRect.height / 2 - tooltipRect.height / 2 + verticalNudge;

  if (x + tooltipRect.width > vw - margin) {
    x = iconRect.left - margin - tooltipRect.width;
  }

  x = Math.max(margin, Math.min(x, vw - tooltipRect.width - margin));
  y = Math.max(margin, Math.min(y, vh - tooltipRect.height - margin));

  pos.value = { x, y };
  positioned.value = true;

  const form = iconRef.value.closest('[data-formitiva-theme]');
  const foundRoot = document.getElementById('popup-root');
  const target = foundRoot || document.body;
  popupTarget.value = target as HTMLElement;

  if (form && foundRoot) {
    const styles = getComputedStyle(form);
    foundRoot.style.setProperty(
      '--formitiva-tooltip-color-bg',
      styles.getPropertyValue('--formitiva-tooltip-color-bg')
    );
    foundRoot.style.setProperty(
      '--formitiva-tooltip-color',
      styles.getPropertyValue('--formitiva-tooltip-color')
    );
  }

  return true;
};

// Retry helper: attempt to compute position, retrying a few times if the tooltip
// isn't measured yet (teleport may render asynchronously).
const ensurePosition = (attempts = 5, delay = 25) => {
  if (computePosition()) return;
  if (attempts <= 0) return;
  setTimeout(() => ensurePosition(attempts - 1, delay), delay);
};

watch(hover, (isHovering) => {
  if (!isHovering || !iconRef.value) {
    positioned.value = false;
    return;
  }

  // If tooltip DOM isn't mounted yet (teleported), wait a tick and try to
  // compute position. Use ensurePosition to retry measurements until ready.
  nextTick(() => {
    if (!hover.value) return;
    ensurePosition(6, 30);
  });
});

const popupTarget = ref<HTMLElement | null>(null);

onMounted(() => {
  if (typeof document === 'undefined') return;
  const r = document.getElementById('popup-root');
  popupTarget.value = (r || document.body) as HTMLElement;
});

const teleportTarget = computed(() => popupTarget.value || document.body);

const tooltipContent = computed(() => ({
  ...tooltipStyles.value.text,
  transform: positioned.value
    ? "translateY(0) scale(1)"
    : "translateY(-4px) scale(0.98)",
  transition: "opacity 120ms ease, transform 120ms ease, visibility 120ms ease",
  width: 240,
  ...(positioned.value ? tooltipStyles.value.textVisible : {}),
  top: `${pos.value.y}px`,
  left: `${pos.value.x}px`,
}));
</script>

<template>
  <div class="formitiva-tooltip-wrapper">
    <span
      data-testid="tooltip-icon"
      ref="iconRef"
      :aria-describedby="hover ? tooltipId : undefined"
      @mouseenter="hover = true"
      @mouseleave="hover = false"
      :style="tooltipStyles.icon"
    >
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </span>
    <Teleport v-if="hover" :to="teleportTarget">
      <div
        ref="tooltipRef"
        :data-tooltip-id="tooltipId"
        :style="tooltipContent"
      >
        {{ t(content) }}
      </div>
    </Teleport>
  </div>
</template>
