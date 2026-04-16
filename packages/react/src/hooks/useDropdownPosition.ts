import React from "react";
import { computeDropdownPosition } from '@formitiva/core';
import type { DropdownPosition } from '@formitiva/core';

export function useDropdownPosition(
  controlRef: React.RefObject<HTMLElement | null>,
  open: boolean,
  maxHeight = 200
) {
  const [pos, setPos] = React.useState<DropdownPosition | null>(null);

  React.useEffect(() => {
    if (!open || !controlRef.current) return;

    const update = () => {
      setPos(computeDropdownPosition(controlRef.current!, maxHeight));
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(controlRef.current);
    }

    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      ro?.disconnect();
    };
  }, [open, controlRef, maxHeight]);

  return pos;
}
