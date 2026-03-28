<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { BaseInputProps, DefinitionPropertyField } from '@formitiva/core';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../../hooks/useFieldValidator";

type ColorOption = {
  label: string;
  value: string;
};

export type ColorInputProps = BaseInputProps<string, DefinitionPropertyField>;

const props = defineProps<ColorInputProps>();

const emit = defineEmits<{
  change: [value: string];
  error: [error: string | null];
}>();

const _ctx = useFormitivaContext();
const t = computed(() => _ctx.t);

const predefinedColors: ColorOption[] = [
  { label: "Black", value: "#000000" },
  { label: "White", value: "#ffffff" },
  { label: "Red", value: "#ff0000" },
  { label: "Green", value: "#008000" },
  { label: "Blue", value: "#0000ff" },
  { label: "Yellow", value: "#ffff00" },
  { label: "Cyan", value: "#00ffff" },
  { label: "Magenta", value: "#ff00ff" },
  { label: "Orange", value: "#ffa500" },
  { label: "Purple", value: "#800080" },
  { label: "Brown", value: "#a52a2a" },
  { label: "Gray", value: "#808080" },
  { label: "Light Gray", value: "#d3d3d3" },
  { label: "Pink", value: "#ffc0cb" },
];

const HEX_REGEX = /^#([0-9A-F]{3}){1,2}$/i;
const DEFAULT_COLOR = "#000000";

const isValidHexColor = (color: string) => HEX_REGEX.test(color);

const normalizeHexColor = (color?: string): string => {
  if (!color || !isValidHexColor(color)) return DEFAULT_COLOR;

  const c = color.toLowerCase();
  if (c.length === 4) {
    return (
      "#" +
      c.slice(1)
       .split("")
       .map((x) => x + x)
       .join("")
    );
  }
  return c;
};

const toRGB = (hex: string) => {
  const value = parseInt(hex.slice(1), 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const validate = useFieldValidator(props.field, props.error);

const normalizedValue = computed(() => normalizeHexColor(props.value));

const { inputRef, error, handleChange, handleBlur } =
  useUncontrolledValidatedInput({
    value: normalizedValue.value,
    onChange: (val: string) => emit('change', val),
    onError: (err: string | null) => emit('error', err),
    validate,
  });

const previewColor = ref(normalizedValue.value);

watch(normalizedValue, (newVal) => {
  previewColor.value = newVal;
});

const handleColorChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const color = normalizeHexColor(target.value);
  previewColor.value = color;
  handleChange({ target: { value: color } } as unknown as Event);
};

const handleSelectChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const color = normalizeHexColor(target.value);
  previewColor.value = color;
  handleChange({ target: { value: color } } as unknown as Event);
};

const predefinedMap = computed(() => new Set(predefinedColors.map((c) => c.value)));
const isPredefined = computed(() => predefinedMap.value.has(previewColor.value));
const rgb = computed(() => toRGB(previewColor.value));
</script>

<template>
  <StandardFieldLayout :field="field" :error="error">
    <div
      style="display: flex; align-items: center; gap: 8px; width: 100%;"
    >
      <select
        :id="field.name"
        :value="previewColor"
        @change="handleSelectChange"
        @blur="handleBlur"
        :class="combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputSelect)"
        :aria-invalid="!!error"
      >
        <option
          v-for="opt in predefinedColors"
          :key="opt.value"
          :value="opt.value"
        >
          {{ t(opt.label) }}
        </option>
        <option v-if="!isPredefined" :value="previewColor">
          RGB ({{ rgb.r }}, {{ rgb.g }}, {{ rgb.b }})
        </option>
      </select>

      <label
        style="
          width: 2.5em;
          height: 1.8em;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
          overflow: hidden;
          flex-shrink: 0;
        "
        :style="{ backgroundColor: previewColor }"
      >
        <input
          :ref="inputRef"
          :id="`${field.name}-color`"
          type="color"
          :defaultValue="previewColor"
          @input="handleColorChange"
          @blur="handleBlur"
          style="opacity: 0; width: 100%; height: 100%"
          :aria-invalid="!!error"
        />
      </label>
    </div>
  </StandardFieldLayout>
</template>
