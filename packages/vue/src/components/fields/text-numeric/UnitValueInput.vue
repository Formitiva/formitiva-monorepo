<script lang="ts">
import { defineComponent, ref, watch, computed, type PropType } from 'vue';
import type { DefinitionPropertyField } from '@formitiva/core';

export default defineComponent({
	name: 'UnitValueInput',
	props: {
		field: { type: Object as () => DefinitionPropertyField, required: true },
		value: { type: Object as PropType<{ value: string; unit: string } | null>, default: null },
		error: { type: String as PropType<string | null>, default: null },
		placeholder: { type: String as PropType<string>, default: '' },
		disabled: { type: Boolean, default: false },
	},
	emits: ['change', 'error'],
	setup(props, { emit }) {
		const fld = props.field as DefinitionPropertyField & { units?: string[]; defaultUnit?: string; required?: boolean; min?: number; max?: number };
		const inputValue = ref<string>((props.value && String(props.value?.value)) || '');
		const selectedUnit = ref<string>((props.value && props.value?.unit) || fld.defaultUnit || '');

		watch(() => props.value, (v) => {
			inputValue.value = (v && String(v?.value)) || '';
			selectedUnit.value = (v && v?.unit) || fld.defaultUnit || '';
		}, { immediate: true });

		const handleInput = (e: Event) => {
			const val = (e.target as HTMLInputElement).value;
			inputValue.value = val;
			emit('change', { value: val, unit: selectedUnit.value });
		};

		const handleUnitChange = (e: Event) => {
			const u = (e.target as HTMLSelectElement).value;
			selectedUnit.value = u;
			emit('change', { value: inputValue.value, unit: u });
		};

		const handleBlur = () => {
			const num = Number(inputValue.value);
			let err: string | null = null;
			if (fld && fld.required && (inputValue.value === '' || inputValue.value == null)) {
				err = 'This field is required';
			}
			if (!err && typeof fld.min !== 'undefined' && !Number.isNaN(num) && num < (fld.min as number)) {
				err = 'Value is below minimum';
			}
			if (!err && typeof fld.max !== 'undefined' && !Number.isNaN(num) && num > (fld.max as number)) {
				err = 'Value is above maximum';
			}
			if (err) emit('error', err);
		};

		const unitOptions = computed(() => fld.units || []);

		return { inputValue, selectedUnit, handleInput, handleUnitChange, handleBlur, unitOptions };
	}
});
</script>

<template>
	<div>
		<input
			:id="field.name"
			type="number"
			:value="inputValue"
			@input="handleInput"
			@blur="handleBlur"
		/>

		<select :value="selectedUnit" @change="handleUnitChange" @blur="handleBlur">
			<option v-for="u in unitOptions" :key="u" :value="u">{{ u }}</option>
		</select>
	</div>
</template>
