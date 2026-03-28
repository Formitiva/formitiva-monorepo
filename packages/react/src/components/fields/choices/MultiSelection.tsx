import * as React from "react";
import * as ReactDOM from "react-dom";

import type { DefinitionPropertyField } from '@formitiva/core';
import type { BaseInputProps } from '@formitiva/core';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import { isDarkTheme } from '@formitiva/core';
import { useFieldValidator } from "../../../hooks/useFieldValidator";

export type OptionsField = DefinitionPropertyField & {
  options: NonNullable<DefinitionPropertyField["options"]>;
};

type MultiSelectionProps = BaseInputProps<string[] | null, OptionsField>;

// ---------------------------
// MULTISELECT COMPONENT
// ---------------------------
const MultiSelect: React.FC<MultiSelectionProps> = ({
  field,
  value,
  onChange,
  onError,
  error: externalError,
}) => {
  const onErrorRef = React.useRef<MultiSelectionProps["onError"] | undefined>(
    onError
  );

  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  const { t, theme, formStyle, fieldStyle } = useFormitivaContext();
  const styleFrom = (
    source: unknown,
    section?: string,
    key?: string
  ): React.CSSProperties => {
    if (!section) return {};
    const src = source as Record<string, unknown> | undefined;
    const sec = src?.[section] as Record<string, unknown> | undefined;
    const val = key && sec ? (sec[key] as React.CSSProperties | undefined) : undefined;
    return (val ?? {}) as React.CSSProperties;
  };
  const controlRef = React.useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [popupPos, setPopupPos] = React.useState<{
    x: number;
    y: number;
  } | null>(null);

  const options = React.useMemo(
    () => field.options.map((o) => ({ value: o.value, label: t(o.label) })),
    [field.options, t]
  );

  const selectedValues = React.useMemo(() => {
    const arr = Array.isArray(value) ? value : [];
    const allowed = new Set(options.map((o) => o.value));
    return arr.filter((v) => allowed.has(v));
  }, [value, options]);

  const validate = useFieldValidator(field, externalError);

  const [multiError, setMultiError] = React.useState<string | null>(null);
  const prevErrorLocalRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const err = validate(Array.isArray(value) ? value : [], "sync");
    if (err !== prevErrorLocalRef.current) {
      prevErrorLocalRef.current = err;
      setMultiError(err);
      onErrorRef.current?.(err ?? null);
    }
  }, [value, validate]);

  // Toggle menu open/close
  const handleControlClick = () => {
    if (!controlRef.current) return;
    const rect = controlRef.current.getBoundingClientRect();
    setPopupPos({ x: rect.left, y: rect.bottom });
    setMenuOpen((prev) => !prev);
  };

  const toggleOption = (val: string) => {
    const newValues = selectedValues.includes(val)
      ? selectedValues.filter((v) => v !== val)
      : [...selectedValues, val];
    const err = validate(newValues, "change");
    if (err !== prevErrorLocalRef.current) {
      prevErrorLocalRef.current = err;
      setMultiError(err);
      onErrorRef.current?.(err ?? null);
    }
    onChange?.(newValues);
  };

  const handleBlur = React.useCallback(() => {
    const err = validate(selectedValues, "blur");
    if (err !== prevErrorLocalRef.current) {
      prevErrorLocalRef.current = err;
      setMultiError(err);
      onErrorRef.current?.(err ?? null);
    }
  }, [selectedValues, validate]);

  const mergedControlStyle = React.useMemo<React.CSSProperties>(
    () => ({
      height: "var(--formitiva-input-height, 2.5rem)",
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
      position: "relative",
      textAlign: "left",
      ...styleFrom(formStyle, "multiSelect", "control"),
      ...styleFrom(fieldStyle, undefined, "control"),
    }),
    [formStyle, fieldStyle]
  );

  const mergedClearButtonStyle = React.useMemo<React.CSSProperties>(
    () => ({
      position: "absolute",
      right: "1.5em",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "0.8em",
      color: "var(--formitiva-text-muted, #999)",
      padding: 0,
      ...styleFrom(formStyle, "multiSelect", "clearButton"),
      ...styleFrom(fieldStyle, undefined, "clearButton"),
    }),
    [formStyle, fieldStyle]
  );

  const mergedArrowStyle = React.useMemo<React.CSSProperties>(
    () => ({
      position: "absolute",
      right: "0.7em",
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      fontSize: "0.8em",
      color: "var(--formitiva-text-muted, #999)",
      ...styleFrom(formStyle, "multiSelect", "arrow"),
      ...styleFrom(fieldStyle, undefined, "arrow"),
    }),
    [formStyle, fieldStyle]
  );

  return (
    <div>
      <StandardFieldLayout field={field} error={multiError}>
        <div style={{ width: "100%" }}>
          <div
            ref={controlRef}
            className={`formitiva-multiselection-control formitiva-input`}
            style={mergedControlStyle}
            onClick={handleControlClick}
            onBlur={handleBlur}
            tabIndex={0}
            role="button"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            aria-invalid={!!multiError}
            aria-describedby={multiError ? `${field.name}-error` : undefined}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleControlClick();
              }
            }}
          >
            <span
              style={{ flex: 1, color: "var(--formitiva-text-muted, #888)" }}
            >
              {selectedValues.length} / {options.length} selected
            </span>

            {selectedValues.length > 0 && (
              <button
                type="button"
                aria-label="Clear selections"
                onClick={(e) => {
                  e.stopPropagation();
                  const err = validate([], "change");
                  if (err !== prevErrorLocalRef.current) {
                    prevErrorLocalRef.current = err;
                    setMultiError(err);
                    onErrorRef.current?.(err ?? null);
                  }
                  onChange?.([]);
                }}
                style={mergedClearButtonStyle}
              >
                {/* use HTML entity to avoid encoding issues on GitHub; use heavy X for delete */}
                <span style={mergedClearButtonStyle} aria-hidden>
                  &#x2716;
                </span>
              </button>
            )}

            <span style={mergedArrowStyle} aria-hidden>
              &#x25BC;
            </span>
          </div>
        </div>
      </StandardFieldLayout>

      {menuOpen && popupPos && (
        <MultiSelectionPopup
          position={popupPos}
          options={options}
          selectedValues={selectedValues}
          onToggleOption={toggleOption}
          onClose={() => setMenuOpen(false)}
          controlRef={controlRef}
          theme={theme}
        />
      )}
    </div>
  );
};

// ---------------------------
// POPUP COMPONENT
// ---------------------------
interface PopupProps {
  position: { x: number; y: number };
  options: NonNullable<DefinitionPropertyField["options"]>;
  selectedValues: string[];
  onToggleOption: (v: string) => void;
  onClose: () => void;
  controlRef: React.RefObject<HTMLDivElement | null>;
  theme?: string;
}

const MultiSelectionPopup: React.FC<PopupProps> = ({
  position,
  options,
  selectedValues,
  onToggleOption,
  onClose,
  controlRef,
  theme,
}) => {
  const popupRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const { formStyle, fieldStyle } = useFormitivaContext();

  const isThemeDark = isDarkTheme(theme ?? "light");

  React.useLayoutEffect(() => {
    if (!controlRef.current) return;

    const form = controlRef.current.closest("[data-formitiva-theme]");
    const popupRoot = document.getElementById("popup-root");

    if (form && popupRoot) {
      const styles = getComputedStyle(form);
      popupRoot.style.setProperty(
        "--formitiva-secondary-bg",
        styles.getPropertyValue("--formitiva-secondary-bg")
      );
      popupRoot.style.setProperty(
        "--formitiva-text-color",
        styles.getPropertyValue("--formitiva-text-color")
      );
      popupRoot.style.setProperty(
        "--formitiva-option-menu-hover-bg",
        styles.getPropertyValue("--formitiva-option-menu-hover-bg")
      );
    }
  }, [controlRef]);

  const styleFrom = (
    source: unknown,
    section?: string,
    key?: string
  ): React.CSSProperties => {
    if (!section) return {} as React.CSSProperties;
    const src = source as Record<string, unknown> | undefined;
    const sec = src?.[section] as Record<string, unknown> | undefined;
    const val =
      key && sec ? (sec[key] as React.CSSProperties | undefined) : undefined;
    return (val ?? {}) as React.CSSProperties;
  };

  const mergedPopupStyles = React.useMemo<React.CSSProperties>(
    () => ({
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
      ...styleFrom(formStyle, "multiSelect", "popup"),
      ...styleFrom(fieldStyle, undefined, "popup"),
    }),
    [formStyle, fieldStyle]
  );

  const mergedPopupOptionStyles = React.useMemo<React.CSSProperties>(
    () => ({
      padding: "6px 8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      background: "transparent",
      color: "var(--formitiva-text-color, #000)",
      ...styleFrom(formStyle, "multiSelect", "option"),
      ...styleFrom(fieldStyle, undefined, "option"),
    }),
    [formStyle, fieldStyle]
  );

  // -----------------------
  // OUTSIDE CLICK HANDLER
  // -----------------------
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !popupRef.current?.contains(target) &&
        !controlRef.current?.contains(target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, controlRef]);

  // focus management for keyboard navigation: set initial active index when popup mounts
  React.useEffect(() => {
    if (!popupRef.current) return;
    // initialize active index to first option (defer state update to avoid sync setState in effect)
    if (options.length > 0) {
      requestAnimationFrame(() =>
        setActiveIndex((idx) => (idx === -1 ? 0 : idx))
      );
    }
  }, [options.length]);

  // when activeIndex changes, move focus to the corresponding option element
  React.useEffect(() => {
    if (!popupRef.current || activeIndex < 0) return;
    const el = popupRef.current.querySelector(
      `#multi-opt-${activeIndex}`
    ) as HTMLElement | null;
    if (el) {
      requestAnimationFrame(() => el.focus());
    }
  }, [activeIndex]);

  // -----------------------
  // PORTAL CONTAINER
  // -----------------------
  // compute live position so popup follows the control when the page/form scrolls
  const baseWidth = 250;
  const maxHeight = 200;

  const [livePos, setLivePos] = React.useState<{
    left: number;
    top: number;
  } | null>(null);
  const [popupWidth, setPopupWidth] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const updatePosition = () => {
      let left = position.x;
      let top = position.y;
      let w = baseWidth;

      const ctrl = controlRef?.current;
      if (ctrl) {
        const rect = ctrl.getBoundingClientRect();
        left = rect.left;
        top = rect.bottom;
        // match popup width to control width (but not smaller than a minimum)
        w = Math.max(80, Math.round(rect.width));
      }

      left = Math.min(left, window.innerWidth - w);
      top = Math.min(top, window.innerHeight - maxHeight);
      setLivePos({ left, top });
      setPopupWidth(w);
    };

    updatePosition();
    // update on scroll (capture to catch scrolls from ancestors) and resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    // observe control resize if available
    let ro: ResizeObserver | null = null;
    const observed = controlRef?.current;
    if (typeof ResizeObserver !== "undefined" && observed) {
      ro = new ResizeObserver(() => updatePosition());
      ro.observe(observed as Element);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      if (ro && observed) ro.unobserve(observed);
    };
    // re-run if controlRef or position prop changes
  }, [controlRef, position.x, position.y]);

  if (typeof window === "undefined") return null;

  let root = document.getElementById("popup-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "popup-root";
    document.body.appendChild(root);
  }

  return ReactDOM.createPortal(
    <div
      ref={popupRef}
      role="listbox"
      aria-activedescendant={
        activeIndex >= 0 ? `multi-opt-${activeIndex}` : undefined
      }
      style={{
        position: "fixed",
        top: livePos ? livePos.top : position.y,
        left: livePos ? livePos.left : position.x,
        width: popupWidth ?? baseWidth,
        // spread the static popup styles
        ...mergedPopupStyles,
      }}
      data-formitiva-theme={theme ?? "light"}
    >
      { options.map((opt, idx) => {
        const selected = selectedValues.includes(opt.value);
        const hoverBg = isThemeDark
          ? "var(--formitiva-option-menu-hover-bg, rgba(255,255,255,0.01))"
          : "var(--formitiva-option-menu-hover-bg, #eee)";
        const optionStyle: React.CSSProperties = {
          ...mergedPopupOptionStyles,
          background:
            idx === activeIndex ? hoverBg : mergedPopupOptionStyles.background,
        };

        return (
          <div
            id={`multi-opt-${idx}`}
            key={opt.value}
            onMouseDown={(e) => {
              e.stopPropagation(); // prevent popup from closing
              onToggleOption(opt.value);
            }}
            onKeyDown={(e) => {
              const len = options.length;
              switch (e.key) {
                case "ArrowDown":
                  e.preventDefault();
                  setActiveIndex((i) => (i + 1) % len);
                  break;
                case "ArrowUp":
                  e.preventDefault();
                  setActiveIndex((i) => (i - 1 + len) % len);
                  break;
                case "Home":
                  e.preventDefault();
                  setActiveIndex(0);
                  break;
                case "End":
                  e.preventDefault();
                  setActiveIndex(len - 1);
                  break;
                case "Enter":
                case " ":
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleOption(opt.value);
                  break;
                case "Escape":
                  e.preventDefault();
                  onClose();
                  controlRef?.current?.focus();
                  break;
              }
            }}
            tabIndex={idx === activeIndex ? 0 : -1}
            role="option"
            aria-selected={selected}
            style={optionStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = hoverBg;
              setActiveIndex(idx);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              setActiveIndex((cur) => (cur === idx ? -1 : cur));
            }}
          >
            <input
              type="checkbox"
              checked={selected}
              readOnly
              style={{
                marginRight: 8,
                width: "1.125em",
                height: "1.125em",
                verticalAlign: "middle",
                accentColor: isThemeDark ? "#10b981" : "#22c55e",
                cursor: "pointer",
              }}
            />
            {opt.label}
          </div>
        );
      })}
    </div>,
    root
  );
};

MultiSelect.displayName = "MultiSelect";
export default React.memo(MultiSelect);
