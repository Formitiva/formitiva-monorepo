<script setup lang="ts">
import { computed } from 'vue';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { CSS_CLASSES } from '@formitiva/core';

interface DescriptionProps {
  field: {
    displayText?: string | string[]; // Can be a string or an array of strings for multiple lines
    textAlign?: "left" | "center" | "right";
    allowHtml?: boolean; // if true, displayText is treated as HTML and rendered with v-html
  };
}

const props = defineProps<DescriptionProps>();
const _ctx = useFormitivaContext();
const t = computed(() => _ctx.t);

const displayTextRaw = computed(() => props.field?.displayText ?? "");
const allowHtml = computed(() => Boolean(props.field?.allowHtml));
const align = computed(() => (props.field?.textAlign ?? "left") as "left" | "center" | "right");

const translated = computed(() => {
  const displayText = displayTextRaw.value;
  if (Array.isArray(displayText)) {
    const mapped = displayText.map((d) => t.value(d));
    return allowHtml.value ? mapped.join("") : mapped.join("\n");
  }
  return t.value(String(displayText));
});

/**
 * Sanitize an HTML string using DOMParser, removing script elements and all
 * inline event-handler / javascript: / data: attributes before rendering with
 * v-html.  This prevents XSS while still allowing safe rich-text markup.
 */
function sanitizeHtml(html: string): string {
  if (typeof DOMParser === 'undefined') return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Remove dangerous elements wholesale
  doc.querySelectorAll('script, style, iframe, object, embed, form, base').forEach(el => el.remove());
  // Strip dangerous attributes from every remaining element
  doc.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      const name = attr.name.toLowerCase();
      const value = attr.value.toLowerCase().replace(/\s+/g, '');
      if (
        name.startsWith('on') ||
        (name === 'href' && (value.startsWith('javascript:') || value.startsWith('data:'))) ||
        (name === 'src'  && (value.startsWith('javascript:') || value.startsWith('data:text/html')))
      ) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return doc.body.innerHTML;
}

const sanitizedHtml = computed(() => sanitizeHtml(translated.value));

const lines = computed<string[]>(() => {
  if (allowHtml.value) return [];
  const raw = translated.value.split(/\r\n|\r|\n/);
  return raw.map((line) => (line === "" ? "" : line.replace(/\t/g, "    ")));
});

const alignStyle = computed(() => ({ textAlign: align.value }));
</script>

<template>
  <div :class="CSS_CLASSES.description" v-if="allowHtml">
    <div :style="alignStyle" v-html="sanitizedHtml"></div>
  </div>
  <div :class="CSS_CLASSES.description" v-else>
    <div :style="alignStyle">
      <div v-for="(line, i) in lines" :key="i">
        <br v-if="line === ''" />
        <template v-else>{{ line }}</template>
      </div>
    </div>
  </div>
</template>
