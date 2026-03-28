<script setup lang="ts" generic="T extends PopupOption">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

export type PopupOptionMenuPosition = {
  x: number;
  y: number;
}

export interface PopupOption {
  label: string;
}

export interface PopupOptionMenuProps<T extends PopupOption> {
  pos: PopupOptionMenuPosition | null;
  options: T[];
}

const props = defineProps<PopupOptionMenuProps<T>>();

const emit = defineEmits<{
  close: [];
  clickOption: [option: T];
}>();

const menuRef = ref<HTMLDivElement | null>(null);
const isSelectingRef = ref(false);
const adjustedPosition = ref({ 
  top: props.pos?.y ?? 0, 
  left: props.pos?.x ?? 0, 
  ready: false 
});

// Prefer an explicit #popup-root if present; otherwise render into document.body
const popupRoot = typeof window !== 'undefined'
  ? document.getElementById('popup-root') || document.body
  : null;

const handleClickOutside = (event: MouseEvent) => {
  // If we're in the process of selecting an option, don't close
  if (isSelectingRef.value) {
    return;
  }

  const target = event.target as HTMLElement;

  // If the click is on a menu item by data attribute, ignore it.
  if (target.dataset?.popupMenu === 'item') {
    return;
  }

  if (
    menuRef.value &&
    event.target instanceof Node &&
    !menuRef.value.contains(event.target)
  ) {
    emit('close');
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

// Calculate adjusted position
const calculatePosition = () => {
  if (!menuRef.value || !props.pos || props.pos.x == null || props.pos.y == null) {
    return;
  }

  const menuRect = menuRef.value.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = props.pos.x;
  let top = props.pos.y;

  // Check if menu would overflow right edge
  if (left + menuRect.width > vw) {
    left = Math.max(0, vw - menuRect.width - 10);
  }

  // Check if menu would overflow bottom edge
  if (top + menuRect.height > vh) {
    top = Math.max(0, props.pos.y - menuRect.height - 5);
  }

  adjustedPosition.value = { top, left, ready: true };
};

watch(() => [props.pos, props.options], () => {
  requestAnimationFrame(calculatePosition);
}, { immediate: true, deep: true });

const handleItemClick = (option: T) => {
  emit('clickOption', option);
  emit('close');
  // Reset flag after a small delay
  setTimeout(() => {
    isSelectingRef.value = false;
  }, 100);
};

const handleItemMouseDown = () => {
  isSelectingRef.value = true;
};

const handleMouseEnter = (e: MouseEvent) => {
  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--formitiva-option-menu-hover-bg, #e0e0e0)';
};

const handleMouseLeave = (e: MouseEvent) => {
  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
};

const shouldRender = () => {
  if (!popupRoot) return false;
  if (props.options === undefined || props.options.length === 0) return false;
  if (!props.pos || props.pos.x == null || props.pos.y == null) return false;
  return true;
};
</script>

<template>
  <Teleport v-if="shouldRender()" :to="popupRoot!">
    <div
      ref="menuRef"
      @mousedown.stop
      style="
        position: fixed;
        background-color: var(--formitiva-primary-bg, #fff);
        border: 1px solid var(--formitiva-border-color, #ccc);
        border-radius: var(--formitiva-border-radius, 4px);
        box-shadow: var(--formitiva-shadow, 0 2px 10px rgba(0,0,0,0.2));
        z-index: 9999;
        min-width: var(--formitiva-menu-min-width, 150px);
        max-height: var(--formitiva-menu-max-height, 300px);
        overflow-y: auto;
        pointer-events: auto;
      "
      :style="{
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
        visibility: adjustedPosition.ready ? 'visible' : 'hidden'
      }"
    >
      <div
        v-for="(option, index) in options"
        :key="option.label ?? index"
        data-popup-menu="item"
        @mousedown.stop="handleItemMouseDown"
        @click.stop.prevent="handleItemClick(option)"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        style="
          padding: var(--formitiva-menu-item-padding, 8px 12px);
          cursor: pointer;
          font-size: var(--formitiva-menu-item-font-size, 0.8em);
          transition: background-color 0.15s ease;
        "
        :style="{
          borderBottom: index < options.length - 1 ? '1px solid var(--formitiva-border-light, #eee)' : undefined
        }"
      >
        {{ option.label }}
      </div>
    </div>
  </Teleport>
</template>
