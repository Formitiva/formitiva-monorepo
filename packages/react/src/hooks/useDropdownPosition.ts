import React from "react";

export function useDropdownPosition(
  controlRef: React.RefObject<HTMLElement | null>,
  open: boolean,
  maxHeight = 200
) {
  const [pos, setPos] = React.useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);

  React.useEffect(() => {
    if (!open || !controlRef.current) return;

    const update = () => {
      const rect = controlRef.current!.getBoundingClientRect();
      let left = rect.left;
      let top = rect.bottom;
      let width = Math.max(80, Math.round(rect.width));

      left = Math.min(left, window.innerWidth - width);
      top = Math.min(top, window.innerHeight - maxHeight);

      setPos({ left, top, width });
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
