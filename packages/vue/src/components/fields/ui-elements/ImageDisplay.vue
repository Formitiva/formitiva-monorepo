<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch } from 'vue';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { BaseInputProps, DefinitionPropertyField } from '@formitiva/core';

export type ImageProps = BaseInputProps<string, DefinitionPropertyField>;

const props = defineProps<ImageProps>();

const _ctx = useFormitivaContext();
const language = computed(() => _ctx.language);
const t = computed(() => _ctx.t);

/**
 * Safe helper to get BASE_URL from environment.
 */
function getBaseUrl(): string {
  try {
    // @ts-ignore - import.meta typing is Vite-specific
    const importMeta = import.meta?.env?.BASE_URL;
    if (typeof importMeta === 'string') return importMeta;
  } catch {
    // import.meta not available
  }

  try {
    if (typeof process !== 'undefined' && process?.env?.PUBLIC_URL) {
      return process.env.PUBLIC_URL;
    }
  } catch {
    // process.env not available
  }

  return '/';
}

// Determine alignment
type ImgField = Partial<DefinitionPropertyField> & {
  src?: string;
  defaultValue?: string;
  localized?: string;
  alignment?: string;
  width?: number;
  height?: number;
  alt?: string | Record<string, string>;
  displayName?: string;
};

const field = (props.field || {}) as ImgField;

const alignment = field.alignment || "center";
const alignmentMap: Record<string, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

// Determine base image URL. Prefer explicit `field.src`, then `props.value`, then `field.defaultValue`.
const valueStr = typeof props.value === "string" ? props.value : "";
const fieldSrc = typeof field.src === 'string' ? field.src : '';
let baseUrl: string = fieldSrc && fieldSrc.trim() !== ''
  ? fieldSrc
  : (valueStr && valueStr.trim() !== ''
    ? valueStr
    : (typeof field.defaultValue === "string" ? field.defaultValue : ""));

// Only prepend base URL for relative paths (not for absolute http(s) or protocol-relative URLs)
if (baseUrl && !baseUrl.startsWith("/") && !baseUrl.startsWith('http://') && !baseUrl.startsWith('https://') && !baseUrl.startsWith('//')) {
  const envBaseUrl = getBaseUrl();
  baseUrl = `${envBaseUrl}${baseUrl}`;
}

const langs = typeof field.localized === 'string'
  ? field.localized.split(";").map((v: string) => v.trim())
  : undefined;

const imageUrl = ref<string>(baseUrl || "");
const lastUrlRef = ref<string | null>(baseUrl || null);
let abortController: AbortController | null = null;

/**
 * Try to resolve a localized version of the image
 */
const resolveLocalizedImage = () => {
  if (!baseUrl) return;

  const parts = baseUrl.split("/");
  const fileName = parts.pop()!;
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1) return;

  const name = fileName.substring(0, dotIndex);
  const ext = fileName.substring(dotIndex);
  let localizedFile: string | null = null;

  if (langs?.includes(language.value)) {
    localizedFile = `${name}_${language.value}${ext}`;
  }

  // Cancel previous fetch
  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();

  if (localizedFile) {
    const localizedPath = [...parts, localizedFile].join("/");
    fetch(localizedPath, { method: "HEAD", signal: abortController.signal })
      .then((res) => {
        const resolved = res.ok ? localizedPath : baseUrl;
        if (resolved !== lastUrlRef.value) {
          lastUrlRef.value = resolved;
          imageUrl.value = resolved;
        }
      })
      .catch(() => {
        if (baseUrl !== lastUrlRef.value) {
          lastUrlRef.value = baseUrl;
          imageUrl.value = baseUrl;
        }
      });
  } else {
    const resolved = baseUrl;
    if (resolved !== lastUrlRef.value) {
      lastUrlRef.value = resolved;
      requestAnimationFrame(() => {
        imageUrl.value = resolved;
      });
    }
  }
};

watch([() => baseUrl, () => language.value], resolveLocalizedImage, { immediate: true });

onBeforeUnmount(() => {
  if (abortController) {
    abortController.abort();
  }
});

// Extract dimensions
const width = field.width;
const height = field.height;

const imgAttributes = () => {
  const attrs: Record<string, number | undefined> = {};
  if (width && height) {
    attrs.width = width;
    attrs.height = height;
  } else if (width && !height) {
    attrs.width = width;
  } else if (!width && height) {
    attrs.height = height;
  }
  return attrs;
};

const imgStyle = () => {
  const style: Record<string, string | number> = {
    borderRadius: "8px",
    objectFit: "contain",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    margin: "0 0 8px 0",
  };

  if (width && height) {
    style.width = `${width}px`;
    style.height = `${height}px`;
  } else if (width && !height) {
    style.width = `${width}px`;
    style.height = "auto";
  } else if (!width && height) {
    style.width = "auto";
    style.height = `${height}px`;
  }

  return style;
};

// Compute alt text, support localized alt maps or simple string
const computeAlt = () => {
  const altProp = field.alt as string | Record<string, string> | undefined;
  const displayName = field.displayName;
  if (!altProp) return t.value?.(displayName || 'Image') || displayName || 'Image';
  if (typeof altProp === 'string') return altProp;
  if (typeof altProp === 'object' && altProp !== null) {
    // Try language key
    if (typeof language.value === 'string' && (altProp as Record<string,string>)[language.value]) return String((altProp as Record<string,string>)[language.value]);
    // Fallback to any available value
    const vals = Object.values(altProp);
    if (vals.length > 0) return String(vals[0]);
  }
  return String(displayName || 'Image');
};
</script>

<template>
  <StandardFieldLayout v-if="imageUrl && props.field" :field="props.field as DefinitionPropertyField">
    <div
      data-testid="image-wrapper"
      style="display: flex; margin: 0 0;"
      :style="{ justifyContent: alignmentMap[alignment] || 'center' }"
    >
      <img
        :src="imageUrl"
        :alt="computeAlt()"
        v-bind="imgAttributes()"
        :style="imgStyle()"
      />
    </div>
  </StandardFieldLayout>
</template>
