import * as React from "react";
import * as ReactDOM from "react-dom";
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { isDarkTheme, isDarkColor } from '@formitiva/core';

const QuestionMark = () => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

type TooltipProps = {
  content: string;
  size?: "small" | "medium" | "large";
  animation?: boolean;
};

const Tooltip: React.FC<TooltipProps> = ({ content, size = "medium", animation = true }) => {
  const { t, theme, formStyle, fieldStyle } = useFormitivaContext();
  const [hover, setHover] = React.useState(false);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const [positioned, setPositioned] = React.useState(false);
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);
  const iconRectRef = React.useRef<DOMRect | null>(null);
  const tooltipId = React.useId();
  const isThemeDark = isDarkTheme(theme);

  const [iconBg, setIconBg] = React.useState<string | undefined>(undefined);

  React.useLayoutEffect(() => {
    if (!ref.current) return;
    const fallback = "rgba(255,255,255,0.1)";
    const styles = getComputedStyle(ref.current);
    const primaryBg = styles.getPropertyValue('--formitiva-primary-bg').trim();

    if (primaryBg && typeof CSS !== "undefined" && CSS.supports?.("color: color-mix(in srgb, red, blue)")) {
        const baseColor = isDarkColor(primaryBg) ? "black" : "white";
        setIconBg(`color-mix(in srgb, var(--formitiva-primary-bg) 85%, ${baseColor} 15%)`);
    } else {
        setIconBg(fallback);
    }
  }, []);

  const tooltipStyles = React.useMemo(() => {
    const sizeConfig: Record<string, React.CSSProperties> = {
      small: { padding: "4px 8px", fontSize: "11px", maxWidth: "200px" },
      medium: { padding: "6px 10px", fontSize: "12px", maxWidth: "240px" },
      large: { padding: "8px 12px", fontSize: "13px", maxWidth: "280px" },
    };

    const base: { icon: React.CSSProperties; text: React.CSSProperties; textVisible: React.CSSProperties } = {
      icon: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "1.2em",
        height: "1.2em",
        fontSize: "0.9em",
        fontWeight: "bold",
        borderRadius: "50%",
        backgroundColor: iconBg ?? (isThemeDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
        color: `var(--formitiva-text-color, ${isThemeDark ? "#f0f0f0" : "#333"})`,
        border: `1px solid ${isThemeDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}`,
        cursor: "pointer",
        transition: animation ? "all 0.2s ease" : undefined,
        marginLeft: "0.3em",
      },
      text: {
        ...sizeConfig[size],
        position: "fixed" as const, // important
        backgroundColor: `var(--formitiva-tooltip-color-bg, ${isThemeDark ? "rgba(45,45,45,0.95)" : "rgba(34, 10, 170, 0.92)"})`,
        color: `var(--formitiva-tooltip-color, ${isThemeDark ? "#f0f0f0" : "#fff"})`,
        borderRadius: "6px",
        border: `1px solid ${isThemeDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
        boxShadow: isThemeDark
          ? "0 8px 16px rgba(0,0,0,0.4)"
          : "0 6px 18px rgba(0,0,0,0.12)",
        zIndex: 2147483647,
        opacity: 0, // hidden by default
        pointerEvents: "none", // prevent blocking mouse events
        transition: animation ? "opacity 0.2s ease" : undefined,
        whiteSpace: "normal",
        wordBreak: "break-word",
        boxSizing: "border-box",
      },
      textVisible: {
        opacity: 1,
        pointerEvents: "auto",
      },
    };

    const styleFrom = (source: unknown, section?: string, key?: string): React.CSSProperties => {
      if (!section) return {} as React.CSSProperties;
      const src = source as Record<string, unknown> | undefined;
      const sec = src?.[section] as Record<string, unknown> | undefined;
      const val = key && sec ? (sec[key] as React.CSSProperties | undefined) : undefined;
      return (val ?? {}) as React.CSSProperties;
    };

    // Merge provider overrides (form-level and field-level)
    const merged = {
      icon: { ...base.icon, ...styleFrom(formStyle, 'tooltip', 'icon'), ...styleFrom(fieldStyle, 'tooltip', 'icon') },
      text: { ...base.text, ...styleFrom(formStyle, 'tooltip', 'text'), ...styleFrom(fieldStyle, 'tooltip', 'text') },
      textVisible: base.textVisible,
    };

    return merged;
  }, [isThemeDark, size, animation, formStyle, fieldStyle, iconBg]);

  React.useLayoutEffect(() => {
    if (!hover || !ref.current || !tooltipRef.current) {
      setPositioned(false);
      return;
    }

    const iconRect = ref.current.getBoundingClientRect();
    iconRectRef.current = iconRect;
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const margin = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const verticalNudge = -4; // visual tweak to better center the bubble with the icon

    // Calculate preferred position: to the right of icon, vertically centered
    let x = iconRect.right + margin;
    let y = iconRect.top + iconRect.height / 2 - tooltipRect.height / 2 + verticalNudge;

    // Flip horizontally if it would overflow right edge
    if (x + tooltipRect.width > vw - margin) {
      x = iconRect.left - margin - tooltipRect.width;
    }

    // Clamp to viewport boundaries
    x = Math.max(margin, Math.min(x, vw - tooltipRect.width - margin));
    y = Math.max(margin, Math.min(y, vh - tooltipRect.height - margin));

    setPos({ x, y });
    setPositioned(true);

    // Update tooltip background and foreground color variables based on form styles
    const form = ref.current.closest('[data-formitiva-theme]');
    const popupRoot = document.getElementById('popup-root');

    if (form && popupRoot) {
      const styles = getComputedStyle(form);
      popupRoot.style.setProperty(
        '--formitiva-tooltip-color-bg',
        styles.getPropertyValue('--formitiva-tooltip-color-bg')
      );
      popupRoot.style.setProperty(
        '--formitiva-tooltip-color',
        styles.getPropertyValue('--formitiva-tooltip-color')
      );
    }
  }, [hover]);

  const popupRoot =
    typeof document !== "undefined"
      ? document.getElementById("popup-root")
      : null;

  // Always render the tooltip icon; if `popup-root` is missing we still show
  // the icon but skip rendering the floating content. Previously the entire
  // tooltip returned null when popup-root was absent which made icons
  // disappear in host apps that don't mount the Formitiva wrapper.
  const tooltipContent = (
    <div
      ref={tooltipRef}
      data-tooltip-id={tooltipId}
      style={{
        ...tooltipStyles.text,
        transform: positioned
          ? "translateY(0) scale(1)"
          : "translateY(-4px) scale(0.98)",
        transition: "opacity 120ms ease, transform 120ms ease, visibility 120ms ease",
        width: 240,
        // When positioned is true, apply the visible styles
        ...(positioned ? tooltipStyles.textVisible : {}),
        top: pos.y,
        left: pos.x,
      }}
    >
      {t(content)}
    </div>
  );
  
  return (
    <>
      <span
        data-testid="tooltip-icon"
        ref={ref}
        aria-describedby={hover ? tooltipId : undefined}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          ...tooltipStyles.icon,
        }}
      >
        <QuestionMark />
      </span>
      {hover &&
        (popupRoot
          ? ReactDOM.createPortal(tooltipContent, popupRoot)
          : tooltipContent)}
    </>
  );
};

export default Tooltip;
