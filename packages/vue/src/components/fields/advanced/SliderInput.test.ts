// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import SliderInput from './SliderInput.vue';
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
  return { name: 'volume', displayName: 'Volume', type: 'slider', min: 0, max: 100, ...overrides } as DefinitionPropertyField;
}

describe('SliderInput (Vue)', () => {
  it('renders a range input', () => {
    const wrapper = mount(SliderInput, {
      props: { field: makeField(), value: 50 },
      global: globalProvide,
    });
    expect(wrapper.find('input[type="range"]').exists()).toBe(true);
  });

  it('renders a text input for direct entry', () => {
    const wrapper = mount(SliderInput, {
      props: { field: makeField(), value: 50 },
      global: globalProvide,
    });
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
  });

  it('range input id is field.name + "-range"', () => {
    const wrapper = mount(SliderInput, {
      props: { field: makeField({ name: 'vol' }), value: 50 },
      global: globalProvide,
    });
    expect(wrapper.find('input[type="range"]').element.id).toBe('vol-range');
  });

  it('text input id is field.name', () => {
    const wrapper = mount(SliderInput, {
      props: { field: makeField({ name: 'vol' }), value: 50 },
      global: globalProvide,
    });
    expect(wrapper.find('input[type="text"]').element.id).toBe('vol');
  });

  it('sets min and max on range input from field', () => {
    const wrapper = mount(SliderInput, {
      props: { field: makeField({ min: 10, max: 90 } as any), value: 50 },
      global: globalProvide,
    });
    const range = wrapper.find('input[type="range"]').element as HTMLInputElement;
    expect(range.min).toBe('10');
    expect(range.max).toBe('90');
  });

  it('renders a label with displayName', () => {
    const wrapper = mount(SliderInput, {
      props: { field: makeField({ displayName: 'Brightness' }), value: 50 },
      global: globalProvide,
    });
    expect(wrapper.find('label').text()).toContain('Brightness');
  });

  it('emits "change" when range input changes', async () => {
    const wrapper = mount(SliderInput, {
      props: { field: makeField(), value: 0 },
      global: globalProvide,
    });
    const range = wrapper.find('input[type="range"]');
    const el = range.element as HTMLInputElement;
    el.value = '50';
    await range.trigger('input');
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('emits "change" when text input changes', async () => {
    const wrapper = mount(SliderInput, {
      props: { field: makeField(), value: 0 },
      global: globalProvide,
    });
    await wrapper.find('input[type="text"]').setValue('75');
    expect(wrapper.emitted('change')).toBeTruthy();
  });
});
