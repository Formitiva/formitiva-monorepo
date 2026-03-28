<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { DefinitionPropertyField } from '@formitiva/core';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { useFieldValidator } from "../../../hooks/useFieldValidator";
import MultiSelectionPopup from "./MultiSelectionPopup.vue";
import type { CSSProperties } from 'vue';

export type OptionsField = DefinitionPropertyField & {
  options: NonNullable<DefinitionPropertyField["options"]>;
};

export default defineComponent({
  name: 'MultiSelection',
  components: { StandardFieldLayout, MultiSelectionPopup },
  props: {
    field: { type: Object as PropType<OptionsField>, required: true },
    value: { type: Array as PropType<string[] | null>, default: null },
    error: { type: String as PropType<string | null>, default: null },
  },
  emits: ['change', 'error'],
  setup(props) {
    const ctx = useFormitivaContext();
    const t = computed(() => ctx.t);
    const validate = useFieldValidator(props.field, props.error);

    const styleFrom = (source: unknown, section?: string, key?: string): CSSProperties => {
      if (!section) return {};
      const src = source as Record<string, unknown> | undefined;
      const sec = src?.[section] as Record<string, unknown> | undefined;
      const val = key && sec ? (sec[key] as CSSProperties | undefined) : undefined;
      return (val ?? {}) as CSSProperties;
    };

    return { t, theme: ctx.theme, formStyle: ctx.formStyle, fieldStyle: ctx.fieldStyle, validate, styleFrom };
  },
  data() {
    return {
      menuOpen: false as boolean,
      popupPos: null as { x: number; y: number } | null,
      multiError: null as string | null,
      prevErrorLocalRef: null as string | null,
    };
  },
  computed: {
    options(): { value: string; label: string }[] {
      return (this.field.options || []).map((o: { value: string; label: string }) => ({ value: o.value, label: this.t(o.label) }));
    },
    selectedValues(): string[] {
      const arr = Array.isArray(this.value) ? this.value : [];
      const allowed = new Set(this.options.map((o) => o.value));
      return arr.filter((v) => allowed.has(v));
    },
    mergedControlStyle(): CSSProperties {
      return {
        height: "var(--formitiva-input-height, 2.5rem)",
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        position: "relative",
        textAlign: "left",
        ...(this.styleFrom(this.formStyle, "multiSelect", "control") as CSSProperties),
        ...(this.styleFrom(this.fieldStyle, undefined, "control") as CSSProperties),
      };
    },
    mergedClearButtonStyle(): CSSProperties {
      return {
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
        ...(this.styleFrom(this.formStyle, "multiSelect", "clearButton") as CSSProperties),
        ...(this.styleFrom(this.fieldStyle, undefined, "clearButton") as CSSProperties),
      };
    },
    mergedArrowStyle(): CSSProperties {
      return {
        position: "absolute",
        right: "0.7em",
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
        fontSize: "0.8em",
        color: "var(--formitiva-text-muted, #999)",
        ...(this.styleFrom(this.formStyle, "multiSelect", "arrow") as CSSProperties),
        ...(this.styleFrom(this.fieldStyle, undefined, "arrow") as CSSProperties),
      };
    },
    controlRefEl(): HTMLDivElement | null {
      return (this.$refs.controlRef as HTMLDivElement | null) ?? null;
    },
  },
  watch: {
    value: {
      immediate: true,
      handler() {
        const vals = Array.isArray(this.value) ? this.value : [];
        const err = this.validate(vals, 'sync');
        if (err !== this.prevErrorLocalRef) {
          this.prevErrorLocalRef = err;
          this.multiError = err;
          this.$emit('error', err);
        }
      },
    },
  },
  methods: {
    handleControlClick(e?: Event) {
      void e;
      const el = (this.$refs.controlRef as HTMLElement | undefined) || null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      this.popupPos = { x: rect.left, y: rect.bottom };
      this.menuOpen = !this.menuOpen;
    },
    toggleOption(val: string) {
      const newValues = this.selectedValues.includes(val)
        ? this.selectedValues.filter((v) => v !== val)
        : [...this.selectedValues, val];
      const err = this.validate(newValues, 'change');
      if (err !== this.prevErrorLocalRef) {
        this.prevErrorLocalRef = err;
        this.multiError = err;
        this.$emit('error', err);
      }
      this.$emit('change', newValues);
    },
    handleBlur() {
      const err = this.validate(this.selectedValues, 'blur');
      if (err !== this.prevErrorLocalRef) {
        this.prevErrorLocalRef = err;
        this.multiError = err;
        this.$emit('error', err);
      }
    },
    handleClearAll(e: MouseEvent) {
      e.stopPropagation();
      const err = this.validate([], 'change');
      if (err !== this.prevErrorLocalRef) {
        this.prevErrorLocalRef = err;
        this.multiError = err;
        this.$emit('error', err);
      }
      this.$emit('change', []);
    },
    handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleControlClick();
      }
    },
  },
});
</script>

<template>
  <div>
    <StandardFieldLayout :field="field" :error="multiError">
      <div style="width: 100%;">
        <div
          ref="controlRef"
          class="formitiva-multiselection-control formitiva-input"
          :style="mergedControlStyle"
          @click="handleControlClick"
          @blur="handleBlur"
          @keydown="handleKeyDown"
          tabindex="0"
          role="button"
          aria-haspopup="listbox"
          :aria-expanded="menuOpen"
          :aria-invalid="!!multiError"
          :aria-describedby="multiError ? `${field.name}-error` : undefined"
        >
          <span style="flex: 1; color: var(--formitiva-text-muted, #888);">
            {{ selectedValues.length }} / {{ options.length }} selected
          </span>

          <button
            v-if="selectedValues.length > 0"
            type="button"
            aria-label="Clear selections"
            @click="handleClearAll"
            :style="mergedClearButtonStyle"
          >
            <span :style="mergedClearButtonStyle" aria-hidden>✖</span>
          </button>

          <span :style="mergedArrowStyle" aria-hidden>▼</span>
        </div>
      </div>
    </StandardFieldLayout>

    <MultiSelectionPopup
      v-if="menuOpen && popupPos"
      :position="popupPos"
      :options="options"
      :selectedValues="selectedValues"
      :controlRef="controlRefEl"
      :theme="theme"
      :formStyle="formStyle"
      :fieldStyle="fieldStyle"
      @toggleOption="toggleOption"
      @close="menuOpen = false"
    />
  </div>
</template>
