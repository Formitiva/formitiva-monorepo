<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import DropdownPopup from "./DropdownPopup.vue";
import type { BaseInputProps, DefinitionPropertyField } from '@formitiva/core';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { useFieldValidator } from "../../../hooks/useFieldValidator";
import type { CSSProperties } from 'vue';

type DropdownField = DefinitionPropertyField & {
  options: NonNullable<DefinitionPropertyField['options']>;
};

export type DropdownInputProps = BaseInputProps<string, DropdownField>;

export default defineComponent({
  name: 'DropdownInput',
  components: { StandardFieldLayout, DropdownPopup },
  props: {
    field: { type: Object as PropType<DropdownField>, required: true },
    value: { type: String as PropType<string | null>, default: null },
    error: { type: String as PropType<string | null>, default: null },
  },
  emits: ['change', 'error'],
  setup(props: DropdownInputProps) {
    const ctx = useFormitivaContext();
    const t = computed(() => ctx.t);
    const validate = useFieldValidator(props.field, props.error);
    return { t, theme: ctx.theme, formStyle: ctx.formStyle, fieldStyle: ctx.fieldStyle, validate };
  },
  data() {
    return {
      menuOpen: false as boolean,
      popupPos: null as { x: number; y: number } | null,
      internalError: null as string | null,
      prevInternalError: null as string | null,
    };
  },
  computed: {
    selectedLabel(): string {
      const opts = (this.field.options || []) as { value: string; label: string }[];
      const opt = opts.find((o) => String(o.value) === String(this.value));
      return opt ? this.t(opt.label) : '';
    },
    mergedControlStyle(): CSSProperties {
      return {
        height: 'var(--formitiva-input-height, 2.5em)',
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
        padding: '0 0.75em',
        cursor: 'pointer',
        position: 'relative',
        textAlign: 'left',
      };
    },
    mergedArrowStyle(): CSSProperties {
      return {
        position: 'absolute',
        right: '0.7em',
        top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        fontSize: '0.8em',
        color: 'var(--formitiva-text-muted, #999)',
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
        const safeVal = String(this.value ?? '');
        const err = (this as unknown as { validate: Function }).validate(safeVal, 'sync') as string | null | undefined;
        // Emit the validation result first so error listeners see it
        (this as unknown as { updateError: Function }).updateError(err ?? null);
        // Then auto-select first option if required+empty but options exist
        if (err && this.field.options && this.field.options.length > 0) {
          const first = String(this.field.options[0].value);
          this.$emit('change', first);
        }
      },
    },
  },
  methods: {
    updateError(next: string | null) {
      if (next !== this.prevInternalError) {
        this.prevInternalError = next;
        this.internalError = next;
        this.$emit('error', next);
      }
    },
    handleControlClick() {
      const el = this.$refs.controlRef as HTMLElement | undefined;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      this.popupPos = { x: rect.left, y: rect.bottom };
      this.menuOpen = !this.menuOpen;
      if (this.menuOpen) {
        this.$nextTick(() => { try { (this.$refs.controlRef as HTMLElement)?.focus(); } catch {} });
      }
    },
    handleOptionClick(val: string) {
      const err = (this as unknown as { validate: Function }).validate(val, 'change') as string | null | undefined;
      this.updateError(err ?? null);
      this.$emit('change', val);
      this.menuOpen = false;
    },
    handleBlur() {
      const err = (this as unknown as { validate: Function }).validate(String(this.value ?? ''), 'blur') as string | null | undefined;
      this.updateError(err ?? null);
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
    <StandardFieldLayout :field="field" :error="internalError">
      <div
        ref="controlRef"
        class="formitiva-input"
        :style="mergedControlStyle"
        @click="handleControlClick"
        @blur="handleBlur"
        @keydown="handleKeyDown"
        tabindex="0"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="menuOpen"
        :aria-invalid="!!internalError"
        :aria-describedby="internalError ? `${field.name}-error` : undefined"
      >
        <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 1.8em; display: block;">
          {{ selectedLabel }}
        </span>
        <span :style="mergedArrowStyle" aria-hidden>▼</span>
      </div>
    </StandardFieldLayout>

    <DropdownPopup
      v-if="menuOpen && popupPos"
      :position="popupPos"
      :options="field.options"
      :selectedValue="String(value)"
      :controlRef="controlRefEl"
      :theme="theme"
      :formStyle="formStyle"
      :fieldStyle="fieldStyle"
      @select="handleOptionClick"
      @close="menuOpen = false"
    />
  </div>
</template>
