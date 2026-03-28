import * as React from "react";
import * as ReactDOM from "react-dom";

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
  onClose: () => void;
  onClickOption: (option: T) => void;
}

export function PopupOptionMenu<T extends PopupOption>({
  pos,
  options,
  onClose,
  onClickOption
}: PopupOptionMenuProps<T>) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const isSelectingRef = React.useRef<boolean>(false);
  const [adjustedPosition, setAdjustedPosition] = React.useState<{ top: number; left: number; ready: boolean }>({ 
    top: pos?.y ?? 0, 
    left: pos?.x ?? 0, 
    ready: false 
  });
  
  // Prefer an explicit `#popup-root` if present; otherwise render into document.body
  const popupRoot =
    typeof window !== "undefined"
      ? document.getElementById("popup-root") || document.body
      : null;
  
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // If we're in the process of selecting an option, don't close
      if (isSelectingRef.current) {
        return;
      }

      const target = event.target as HTMLElement;

      // If the click is on a menu item by data attribute, ignore it.
      if (target.dataset?.popupMenu === "item") {
        return;
      }

      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Calculate adjusted position based on menu dimensions and viewport
  // Use useLayoutEffect to avoid visual flash
  React.useLayoutEffect(() => {
    if (!menuRef.current || !pos || pos.x == null || pos.y == null) {
      return;
    }

    const menuRect = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = pos.x;
    let top = pos.y;

    // Check if menu would overflow right edge
    if (left + menuRect.width > vw) {
      // Try to align to the right edge of viewport with some padding
      left = Math.max(0, vw - menuRect.width - 10);
    }

    // Check if menu would overflow bottom edge
    if (top + menuRect.height > vh) {
      // Flip to show above the trigger element
      // Assume the trigger has some height, subtract menu height and a small gap
      top = Math.max(0, pos.y - menuRect.height - 5);
    }

    setAdjustedPosition({ top, left, ready: true });
  }, [pos, options]);

  if (!popupRoot) return null;
  if (options === undefined || options.length === 0) return null;
  // allow 0 coordinates; only bail when pos or coordinates are null/undefined
  if (!pos || pos.x == null || pos.y == null) return null;

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      style={{
        position: "fixed",
        top: adjustedPosition.top,
        left: adjustedPosition.left,
        visibility: adjustedPosition.ready ? "visible" : "hidden",
        backgroundColor: "var(--formitiva-primary-bg, #fff)",
        border: "1px solid var(--formitiva-border-color, #ccc)",
        borderRadius: "var(--formitiva-border-radius, 4px)",
        boxShadow: "var(--formitiva-shadow, 0 2px 10px rgba(0,0,0,0.2))",
        zIndex: 9999,
        minWidth: "var(--formitiva-menu-min-width, 150px)",
        maxHeight: "var(--formitiva-menu-max-height, 300px)",
        overflowY: "auto",
        pointerEvents: "auto",
      }}
    >
      {options.map((option: T, index: number) => (
        <div
          key={option.label ?? index}
          data-popup-menu="item"
          onMouseDown={(e) => {
            e.stopPropagation();
            isSelectingRef.current = true;
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClickOption(option);
            onClose();
            // Reset flag after a small delay
            setTimeout(() => {
              isSelectingRef.current = false;
            }, 100);
          }}
          style={{
            padding: "var(--formitiva-menu-item-padding, 8px 12px)",
            cursor: "pointer",
            fontSize: "var(--formitiva-menu-item-font-size, 0.8em)",
            borderBottom: index < options.length - 1 ? "1px solid var(--formitiva-border-light, #eee)" : undefined,
            transition: "background-color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--formitiva-option-menu-hover-bg, #e0e0e0)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          {option.label}
        </div>
      ))}
    </div>,
    popupRoot
  );
};

export default PopupOptionMenu;