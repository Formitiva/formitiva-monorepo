import { ref, watch, onUnmounted, type Ref } from "vue";
import { computeDropdownPosition } from '@formitiva/core';
import type { DropdownPosition } from '@formitiva/core';

export function useDropdownPosition(
  controlRef: Ref<HTMLElement | null>,
  open: Ref<boolean> | boolean,
  maxHeight = 200
) {
  const pos = ref<DropdownPosition | null>(null);

  const openValue = typeof open === 'boolean' ? ref(open) : open;

  const update = () => {
    if (!controlRef.value) return;
    pos.value = computeDropdownPosition(controlRef.value, maxHeight);
  };

  let ro: ResizeObserver | null = null;

  watch([openValue, controlRef], ([isOpen, element]) => {
    if (!isOpen || !element) {
      pos.value = null;
      return;
    }

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);

    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(element);
    }
  }, { immediate: true });

  onUnmounted(() => {
    window.removeEventListener("scroll", update, true);
    window.removeEventListener("resize", update);
    ro?.disconnect();
  });

  return pos;
}
