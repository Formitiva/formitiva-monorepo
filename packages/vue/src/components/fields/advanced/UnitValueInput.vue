<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { BaseInputProps, DefinitionPropertyField } from '@formitiva/core';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import PopupOptionMenu from "../base/PopupOptionMenu.vue";
import type { PopupOptionMenuPosition } from "../base/PopupOptionMenu.vue";
import { getUnitFactors, convertTemperature } from '@formitiva/core';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useFieldValidator } from "../../../hooks/useFieldValidator";

type UnitValueInputProps = BaseInputProps<[string | number, string], DefinitionPropertyField>;

interface UnitOption {
  label: string;
  value: string;
  unit: string;
}

const props = defineProps<UnitValueInputProps>();

const emit = defineEmits<{
  change: [value: [string | number, string]];
  error: [error: string | null];
}>();

const _ctx = useFormitivaContext();
const t = computed(() => _ctx.t);
const validate = useFieldValidator(props.field);

const error = ref<string | null>(null);
const prevError = ref<string | null>(null);

const updateError = (next: string | null) => {
  if (next !== prevError.value) {
    prevError.value = next;
    error.value = next;
    emit('error', next);
  }
};

const dimension = props.field.dimension;

// Load unit factors for this dimension
const unitFactors = computed(() => {
  if (!dimension) return null;
  return getUnitFactors(dimension);
});

// Parse current value
const currentValue = String(props.value?.[0] ?? "");
const currentUnit = String(props.value?.[1] ?? unitFactors.value?.default ?? "");

// Controlled state
const inputValue = ref(currentValue);
const selectedUnit = ref(currentUnit);

// Sync with props
watch(() => props.value?.[0], (newVal) => {
  inputValue.value = String(newVal ?? "");
});

watch(() => props.value?.[1], (newVal) => {
  selectedUnit.value = String(newVal ?? unitFactors.value?.default ?? "");
});

watch([inputValue, selectedUnit], () => {
  updateError(validate([inputValue.value, selectedUnit.value], "sync"));
});

// Handlers
const handleValueChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const newValue = target.value;
  inputValue.value = newValue;
  updateError(validate([newValue, selectedUnit.value], "change"));
  emit('change', [newValue, selectedUnit.value]);
};

const handleUnitChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const newUnit = target.value;
  selectedUnit.value = newUnit;
  updateError(validate([inputValue.value, newUnit], "change"));
  emit('change', [inputValue.value, newUnit]);
};

const handleBlur = () => {
  updateError(validate([inputValue.value, selectedUnit.value], "blur"));
};

// Conversion button state
const showMenu = ref(false);
const menuPosition = ref<PopupOptionMenuPosition | null>(null);
const menuOptions = ref<UnitOption[]>([]);

const handleConversionClick = (e: MouseEvent) => {
  if (disableConversion.value) return;

  const parsedValue = parseFloat(inputValue.value);
  if (!Number.isFinite(parsedValue)) return;

  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  menuPosition.value = { x: rect.left, y: rect.bottom };

  // Generate conversion options
  const options: UnitOption[] = [];
  const isTemp = dimension === "temperature";

  if (isTemp && unitFactors.value) {
    unitFactors.value.units.forEach((toUnit) => {
      const converted = convertTemperature(selectedUnit.value, toUnit, parsedValue);
      if (Number.isFinite(converted)) {
        options.push({
          label: `${converted.toFixed(6)} ${t.value(toUnit)}`,
          value: converted.toString(),
          unit: toUnit,
        });
      }
    });
  } else if (unitFactors.value) {
    const fromFactor = unitFactors.value.factors[selectedUnit.value];
    if (fromFactor !== undefined) {
      Object.entries(unitFactors.value.factors).forEach(([toUnit, toFactor]) => {
        const converted = (parsedValue / fromFactor) * toFactor;
        if (Number.isFinite(converted)) {
          options.push({
              label: `${converted.toFixed(6)} ${t.value(toUnit)}`,
            value: converted.toString(),
            unit: toUnit,
          });
        }
      });
    }
  }

  menuOptions.value = options;
  showMenu.value = options.length > 0;
};

const handleConversionSelect = (option: UnitOption) => {
  inputValue.value = option.value;
  selectedUnit.value = option.unit;
  emit('change', [option.value, option.unit]);
};

const handleMenuClose = () => {
  showMenu.value = false;
  menuPosition.value = null;
};

// Memoize unit options
const unitOptions = computed(() => {
  if (!unitFactors.value) return [];
  return unitFactors.value.units.map((u) => ({
    key: u,
    value: u,
    label: t.value(u),
  }));
});

const disableConversion = computed(() => Boolean(error.value) || !inputValue.value.trim());

if (!dimension || !unitFactors.value) {
  // Early exit if no dimension
}
</script>

<template>
  <StandardFieldLayout v-if="dimension && unitFactors" :field="field" :error="error">
    <div style="display: flex; align-items: center; gap: var(--formitiva-unit-gap, 8px); width: 100%;">
      <input
        :id="field.name"
        type="text"
        :value="inputValue"
        @input="handleValueChange"
        @blur="handleBlur"
        style="flex: 2 1 0"
        :class="combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${field.name}-error` : undefined"
      />

      <select
        :id="`${field.name}-unit`"
        :value="selectedUnit"
        @change="handleUnitChange"
        @blur="handleBlur"
        style="flex: 1 1 0"
        :class="combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputSelect)"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${field.name}-error` : undefined"
      >
        <option
          v-for="opt in unitOptions"
          :key="opt.key"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <button
        @click="handleConversionClick"
        :disabled="disableConversion"
        :aria-disabled="disableConversion"
        style="
          width: var(--formitiva-unit-btn-width, 2.5em);
          height: auto;
          padding: var(--formitiva-input-padding);
          box-sizing: border-box;
          border: none;
          border-radius: var(--formitiva-button-border-radius, var(--formitiva-border-radius, 0.25em));
          color: var(--formitiva-button-text, #ffffff);
          display: flex;
          align-items: center;
          justify-content: center;
          align-self: center;
          line-height: 1;
        "
        :style="{
          backgroundColor: disableConversion
            ? 'var(--formitiva-button-disabled-bg, #cccccc)'
            : 'var(--formitiva-button-bg, var(--formitiva-success-color))',
          cursor: disableConversion ? 'not-allowed' : 'pointer',
          opacity: disableConversion ? 0.6 : 1
        }"
      >
        <span style="font-size: 1em; pointer-events: none;">
          ⇄
        </span>
      </button>

      <PopupOptionMenu
        v-if="showMenu && menuOptions.length > 0"
        :pos="menuPosition"
        :options="menuOptions"
        @close="handleMenuClose"
        @clickOption="handleConversionSelect"
      />
    </div>
  </StandardFieldLayout>
</template>
