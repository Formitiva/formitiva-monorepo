import * as React from "react";
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from '@formitiva/core';

export type ImageProps = BaseInputProps<string, DefinitionPropertyField>;

/**
 * Safe helper to get BASE_URL from environment.
 * Works across Vite, webpack (CRA), Next.js, and other bundlers.
 * Falls back to '/' if no env value is available.
 */
function getBaseUrl(): string {
  try {
    // Try Vite's import.meta.env.BASE_URL
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - import.meta typing is Vite-specific
    const importMeta = import.meta?.env?.BASE_URL;
    if (typeof importMeta === 'string') return importMeta;
  } catch {
    // import.meta not available in this environment
  }

  try {
    // Try webpack/CRA process.env.PUBLIC_URL
    if (typeof process !== 'undefined' && process?.env?.PUBLIC_URL) {
      return process.env.PUBLIC_URL;
    }
  } catch {
    // process.env not available
  }

  // Fallback to root
  return '/';
}

/**
 * ImageDisplay is a React component that renders an image with optional
 * localization and flexible layout/styling options.
 *
 * Features:
 * - Localized image fallback based on current language (e.g., _fr, _zhcn suffixes).
 * - Supports left, center, or right alignment.
 * - Supports both row and column layout via field.labelLayout property
 * - Dynamically handles width and height:
 *    - If both are specified, uses them directly.
 *    - If only one is specified, uses that and sets the other to `auto`.
 *    - If neither is specified, renders the image without size constraints.
 */
const ImageDisplay: React.FC<ImageProps> = ({ field, value }) => {
  const { language, t } = useFormitivaContext();

  // Determine alignment
  const alignment = field.alignment || "center";
  const alignmentMap: Record<string, string> = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };

  // Determine base image URL from value or defaultValue.
  // Treat an empty string `value` as absent so `defaultValue` can be used as a fallback.
  const valueStr = typeof value === "string" ? value : "";
  let baseUrl: string = valueStr && valueStr.trim() !== ""
    ? valueStr
    : (typeof field.defaultValue === "string" ? field.defaultValue : "");
  if (baseUrl && !baseUrl.startsWith("/")) {
    // Safe cross-bundler base URL resolution
    const envBaseUrl = getBaseUrl();
    baseUrl = `${envBaseUrl}${baseUrl}`;
  }
  const langs = field.localized?.split(";").map((v) => v.trim());

  const [imageUrl, setImageUrl] = React.useState<string>(baseUrl || "");
  const lastUrlRef = React.useRef<string | null>(baseUrl || null);

  /**
   * Try to resolve a localized version of the image
   * based on the current language (if available).
   * Falls back to the base URL if not found.
   */
  React.useEffect(() => {
    if (!baseUrl) return;

    const parts = baseUrl.split("/");
    const fileName = parts.pop()!;
    const dotIndex = fileName.lastIndexOf(".");
    if (dotIndex === -1) return;

    const name = fileName.substring(0, dotIndex);
    const ext = fileName.substring(dotIndex);
    let localizedFile: string | null = null;

    if (langs?.includes(language)) {
      localizedFile = `${name}_${language}${ext}`;
    }

    // Use AbortController for fetch cancellation and set state directly
    const controller = new AbortController();

    if (localizedFile) {
      const localizedPath = [...parts, localizedFile].join("/");
      fetch(localizedPath, { method: "HEAD", signal: controller.signal })
        .then((res) => {
          const resolved = res.ok ? localizedPath : baseUrl;
          if (resolved !== lastUrlRef.current) {
            lastUrlRef.current = resolved;
            setImageUrl(resolved);
          }
        })
        .catch(() => {
          if (baseUrl !== lastUrlRef.current) {
            lastUrlRef.current = baseUrl;
            setImageUrl(baseUrl);
          }
        });
    } else {
      // Defer setState slightly to avoid sync setState-in-effect warnings
      const resolved = baseUrl;
      if (resolved !== lastUrlRef.current) {
        lastUrlRef.current = resolved;
        requestAnimationFrame(() => setImageUrl(resolved));
      }
    }

    return () => {
      controller.abort();
    };
  }, [baseUrl, language, langs]);

  if (!imageUrl) return null;

  // Extract dimensions
  const { width, height } = field;

  /**
   * Set image attributes and style dynamically:
   * - If both width and height are set: use both.
   * - If only one is set: use it, and set the other to "auto".
   * - If neither is set: don't apply dimensions.
   */
  const imgAttributes: Partial<React.ImgHTMLAttributes<HTMLImageElement>> = {};
  const imgStyle: React.CSSProperties = {
    borderRadius: "8px",
    objectFit: "contain",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    margin: "0 0 8px 0",
  };

  if (width && height) {
    imgAttributes.width = width;
    imgAttributes.height = height;
    imgStyle.width = `${width}px`;
    imgStyle.height = `${height}px`;
  } else if (width && !height) {
    imgAttributes.width = width;
    imgStyle.width = `${width}px`;
    imgStyle.height = "auto";
  } else if (!width && height) {
    imgAttributes.height = height;
    imgStyle.width = "auto";
    imgStyle.height = `${height}px`;
  }

  return (
    <StandardFieldLayout field={field}>
      <div
        data-testid="image-wrapper"
        style={{
          display: "flex",
          justifyContent: alignmentMap[alignment] || "center",
          margin: "0 0",
        }}
      >
        <img
          src={imageUrl}
          alt={t?.(field.displayName || "Image") || field.displayName || "Image"}
          {...imgAttributes}
          style={imgStyle}
        />
      </div>
    </StandardFieldLayout>
  );
};

ImageDisplay.displayName = "ImageDisplay";
export default React.memo(ImageDisplay);
