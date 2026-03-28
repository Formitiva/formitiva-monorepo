import * as React from "react";
import * as ReactDOM from "react-dom";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from '@formitiva/core';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { isDarkTheme } from '@formitiva/core';
import { useFieldValidator } from "../../../hooks/useFieldValidator";

type DropdownField = DefinitionPropertyField & {
  options: NonNullable<DefinitionPropertyField['options']>;
};

export type DropdownInputProps = BaseInputProps<
  string,
  DropdownField
>;

/**
 * DropdownInput
 *
 * Renders a custom dropdown for selecting a single value from options.
 * - Validates that the selected value is in the options list
 * - Auto-corrects to first option if invalid value provided
 * - Uses custom styling from fieldStyle.dropdown
 */
const DropdownInput: React.FC<DropdownInputProps> = ({
  field,
  value,
  onChange,
  onError,
  error: externalError,
}) => {
  const { t, theme, formStyle, fieldStyle } = useFormitivaContext();
  const controlRef = React.useRef<HTMLDivElement>(null);
  const onErrorRef = React.useRef<DropdownInputProps["onError"] | undefined>(onError);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [popupPos, setPopupPos] = React.useState<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const validate = useFieldValidator(field, externalError);
  
  const [error, setError] = React.useState<string | null>(null);
  const prevErrorRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const safeVal = String(value ?? "");
    let err = validate(safeVal, "sync");
    if (err && field.options.length > 0) {
      const first = String(field.options[0].value);
      onChange?.(first);
      err = null;
    }
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      setError(err);
      onErrorRef.current?.(err ?? null);
    }
  }, [value, validate, onChange, field.options]);

  const handleControlClick = () => {
    if (!controlRef.current) return;
    const rect = controlRef.current.getBoundingClientRect();
    setPopupPos({ x: rect.left, y: rect.bottom });
    setMenuOpen((prev) => !prev);
  };

  const handleOptionClick = (val: string) => {
    const err = validate(val, "change");
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      setError(err);
      onErrorRef.current?.(err ?? null);
    }
    onChange?.(val);
    setMenuOpen(false);
  };

  const handleBlur = React.useCallback(() => {
    const err = validate(String(value ?? ""), "blur");
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      setError(err);
      onErrorRef.current?.(err ?? null);
    }
  }, [validate, value]);

  const selectedLabel = React.useMemo(() => {
    const opt = field.options.find(o => String(o.value) === String(value));
    return opt ? t(opt.label) : "";
  }, [field.options, value, t]);

  const styleFrom = (source: unknown, section?: string, key?: string): React.CSSProperties => {
    if (!section) return {};
    const src = source as Record<string, unknown> | undefined;
    const sec = src?.[section] as Record<string, unknown> | undefined;
    const val = key && sec ? (sec[key] as React.CSSProperties | undefined) : undefined;
    return (val ?? {}) as React.CSSProperties;
  };

  const mergedControlStyle = React.useMemo<React.CSSProperties>(() => ({
    height: "var(--formitiva-input-height, 2.5em)",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
    padding: "0 0.75em",
    cursor: "pointer",
    position: "relative",
    textAlign: "left",
    ...styleFrom(formStyle, 'dropdown', 'control'),
    ...styleFrom(fieldStyle, undefined, 'control'),
  }), [formStyle, fieldStyle]);

  const mergedArrowStyle = React.useMemo<React.CSSProperties>(() => ({
    position: "absolute",
    right: "0.7em",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    fontSize: "0.8em",
    color: "var(--formitiva-text-muted, #999)",
    ...styleFrom(formStyle, 'dropdown', 'arrow'),
    ...styleFrom(fieldStyle, undefined, 'arrow'),
  }), [formStyle, fieldStyle]);

  return (
    <div>
      <StandardFieldLayout field={field} error={error}>
        <div
          ref={controlRef}
          className="formitiva-input"
          style={mergedControlStyle}
          onClick={handleControlClick}
          tabIndex={0}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleControlClick();
            }
          }}
          onBlur={handleBlur}
        >
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '1.8em', display: 'block' }}>
            {selectedLabel}
          </span>
          <span style={mergedArrowStyle} aria-hidden>&#x25BC;</span>
        </div>
      </StandardFieldLayout>

      {menuOpen && popupPos && (
        <DropdownPopup
          position={popupPos}
          options={field.options}
          selectedValue={String(value)}
          onSelect={handleOptionClick}
          onClose={() => setMenuOpen(false)}
          controlRef={controlRef}
          theme={theme}
          t={t}
        />
      )}
    </div>
  );
};

interface PopupProps {
  position: { x: number; y: number };
  options: NonNullable<DefinitionPropertyField['options']>;
  selectedValue: string;
  onSelect: (v: string) => void;
  onClose: () => void;
  controlRef: React.RefObject<HTMLDivElement | null>;
  theme?: string;
  t: (key: string) => string;
}

const DropdownPopup: React.FC<PopupProps> = ({
  position,
  options,
  selectedValue,
  onSelect,
  onClose,
  controlRef,
  theme,
  t,
}) => {
  const popupRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const { formStyle, fieldStyle } = useFormitivaContext();

  const isThemeDark = isDarkTheme(theme ?? 'light');

  React.useLayoutEffect(() => {
    if (!controlRef.current) return;
    
    const form = controlRef.current.closest('[data-formitiva-theme]');
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
  }, [controlRef]);

  const styleFrom = (
    source: unknown,
    section?: string,
    key?: string
  ): React.CSSProperties => {
    if (!section) return {} as React.CSSProperties;
    const src = source as Record<string, unknown> | undefined;
    const sec = src?.[section] as Record<string, unknown> | undefined;
    const val = key && sec ? (sec[key] as React.CSSProperties | undefined) : undefined;
    return (val ?? {}) as React.CSSProperties;
  };

  const mergedPopupStyles = React.useMemo<React.CSSProperties>(() => ({
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
    ...styleFrom(formStyle, 'dropdown', 'popup'),
    ...styleFrom(fieldStyle, undefined, 'popup'),
  }), [formStyle, fieldStyle]);

  const mergedPopupOptionStyles = React.useMemo<React.CSSProperties>(() => ({
    padding: "6px 8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    background: "transparent",
    color: "var(--formitiva-text-color, #000)",
    ...styleFrom(formStyle, 'dropdown', 'option'),
    ...styleFrom(fieldStyle, undefined, 'option'),
  }), [formStyle, fieldStyle]);

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

  React.useEffect(() => {
    if (!popupRef.current) return;
    if (options.length > 0) {
      const idx = options.findIndex(o => String(o.value) === selectedValue);
      requestAnimationFrame(() => setActiveIndex(idx >= 0 ? idx : 0));
    }
  }, [options, selectedValue]);

  // when activeIndex changes, move focus to the corresponding option element
  React.useEffect(() => {
    if (!popupRef.current || activeIndex < 0) return;
    const el = popupRef.current.querySelector(`#opt-${activeIndex}`) as HTMLElement | null;
    if (el) {
      requestAnimationFrame(() => el.focus());
    }
  }, [activeIndex]);

  const baseWidth = 250;
  const maxHeight = 200;

  const [livePos, setLivePos] = React.useState<{ left: number; top: number } | null>(null);
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
        w = Math.max(80, Math.round(rect.width));
      }

      left = Math.min(left, window.innerWidth - w);
      top = Math.min(top, window.innerHeight - maxHeight);
      setLivePos({ left, top });
      setPopupWidth(w);
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

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
      aria-activedescendant={activeIndex >= 0 ? `opt-${activeIndex}` : undefined}
      style={{
        position: "fixed",
        top: livePos ? livePos.top : position.y,
        left: livePos ? livePos.left : position.x,
        width: popupWidth ?? baseWidth,
        ...mergedPopupStyles,
      }}
      data-formitiva-theme={theme ?? 'light'}
    >
      {options.map((opt, idx) => {
        const isSelected = String(opt.value) === selectedValue;
        const hoverBg = isThemeDark
          ? "var(--formitiva-option-menu-hover-bg, rgba(255,255,255,0.01))"
          : "var(--formitiva-option-menu-hover-bg, #eee)";
        const optionStyle: React.CSSProperties = {
          ...mergedPopupOptionStyles,
          background: idx === activeIndex ? hoverBg : mergedPopupOptionStyles.background,
          fontWeight: isSelected ? 'bold' : 'normal',
        };

        return (
          <div
            id={`opt-${idx}`}
            key={String(opt.value)}
            onMouseDown={(e) => {
              e.stopPropagation();
              onSelect(String(opt.value));
            }}
            onKeyDown={(e) => {
              const len = options.length;
              switch (e.key) {
                case 'ArrowDown':
                  e.preventDefault();
                  setActiveIndex((i) => (i + 1) % len);
                  break;
                case 'ArrowUp':
                  e.preventDefault();
                  setActiveIndex((i) => (i - 1 + len) % len);
                  break;
                case 'Home':
                  e.preventDefault();
                  setActiveIndex(0);
                  break;
                case 'End':
                  e.preventDefault();
                  setActiveIndex(len - 1);
                  break;
                case 'Enter':
                case ' ':
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(String(opt.value));
                  break;
                case 'Escape':
                  e.preventDefault();
                  onClose();
                  controlRef?.current?.focus();
                  break;
              }
            }}
            tabIndex={idx === activeIndex ? 0 : -1}
            role="option"
            aria-selected={isSelected}
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
            {t(opt.label)}
          </div>
        );
      })}
    </div>,
    root
  );
};

DropdownInput.displayName = "DropdownInput";
export default React.memo(DropdownInput);
