// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import DateInput from './DateInput.vue';
import { FormitivaContextKey } from '../../../hooks/useFormitivaContext';
import type { FormitivaContextType, DefinitionPropertyField } from '@formitiva/core';

const mockCtx: FormitivaContextType = {
  definitionName: '',
  language: 'en',
  theme: 'light',
  formStyle: { container: {}, titleStyle: {} },
  fieldStyle: {},
  t: (s: string) => s,
  fieldValidationMode: 'onSubmission',
  displayInstanceName: false,
};

const globalProvide = {
  provide: { [FormitivaContextKey as symbol]: mockCtx },
};

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'dob', displayName: 'Date of Birth', type: 'date', ...overrides } as DefinitionPropertyField;
}

describe('DateInput (Vue)', () => {
  it('renders input[type="date"]', () => {
    const wrapper = mount(DateInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('input[type="date"]').exists()).toBe(true);
  });

  it('sets id to field.name', () => {
    const wrapper = mount(DateInput, {
      props: { field: makeField({ name: 'eventDate' }), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('input').attributes('id')).toBe('eventDate');
  });

  it('renders label with displayName', () => {
    const wrapper = mount(DateInput, {
      props: { field: makeField({ displayName: 'Birth Date' }), value: '' },
      global: globalProvide,
    });
    expect(wrapper.text()).toContain('Birth Date');
  });

  it('accepts a valid YYYY-MM-DD initial value', () => {
    const wrapper = mount(DateInput, {
      props: { field: makeField(), value: '2024-06-15' },
      global: globalProvide,
    });
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.defaultValue ?? input.getAttribute('defaultvalue')).toBe('2024-06-15');
  });

  it('applies min date attribute', () => {
    const wrapper = mount(DateInput, {
      props: { field: makeField({ minDate: '2020-01-01' } as any), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('input').attributes('min')).toBe('2020-01-01');
  });

  it('applies max date attribute', () => {
    const wrapper = mount(DateInput, {
      props: { field: makeField({ maxDate: '2030-12-31' } as any), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('input').attributes('max')).toBe('2030-12-31');
  });

  it('emits change on input event', async () => {
    const wrapper = mount(DateInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    const input = wrapper.find('input');
    await input.setValue('2025-03-14');
    expect(wrapper.emitted('change')).toBeTruthy();
  });
});
