import { ref, watch, onUnmounted, type Ref } from "vue";

export function useDropdownPosition(
  controlRef: Ref<HTMLElement | null>,
  open: Ref<boolean> | boolean,
  maxHeight = 200
) {
  const pos = ref<{
    left: number;
    top: number;
    width: number;
  } | null>(null);

  const openValue = typeof open === 'boolean' ? ref(open) : open;

  const update = () => {
    if (!controlRef.value) return;
    
    const rect = controlRef.value.getBoundingClientRect();
    let left = rect.left;
    let top = rect.bottom;
    let width = Math.max(80, Math.round(rect.width));

    left = Math.min(left, window.innerWidth - width);
    top = Math.min(top, window.innerHeight - maxHeight);

    pos.value = { left, top, width };
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
