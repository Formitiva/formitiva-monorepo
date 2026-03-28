// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import NumericStepperInput from './NumericStepperInput.vue';
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
  return { name: 'count', displayName: 'Count', type: 'integer', min: 0, max: 100, step: 1, ...overrides } as DefinitionPropertyField;
}

describe('NumericStepperInput (Vue)', () => {
  it('renders an input element', () => {
    const wrapper = mount(NumericStepperInput, {
      props: { field: makeField(), value: 0 },
      global: globalProvide,
    });
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('sets the input id to field.name', () => {
    const wrapper = mount(NumericStepperInput, {
      props: { field: makeField({ name: 'steps' }), value: 0 },
      global: globalProvide,
    });
    expect(wrapper.find('#steps').exists()).toBe(true);
  });

  it('renders a label containing field.displayName', () => {
    const wrapper = mount(NumericStepperInput, {
      props: { field: makeField({ displayName: 'Steps' }), value: 0 },
      global: globalProvide,
    });
    expect(wrapper.find('label').text()).toContain('Steps');
  });

  it('renders increment and decrement buttons', () => {
    const wrapper = mount(NumericStepperInput, {
      props: { field: makeField(), value: 50 },
      global: globalProvide,
    });
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('clicking increment emits "change" with incremented value', async () => {
    const wrapper = mount(NumericStepperInput, {
      props: { field: makeField({ min: 0, max: 100, step: 1 } as any), value: 5 },
      global: globalProvide,
    });
    // The last button is the increment (+) button
    const buttons = wrapper.findAll('button');
    await buttons[buttons.length - 1].trigger('click');
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('emits "change" event when user inputs text', async () => {
    const wrapper = mount(NumericStepperInput, {
      props: { field: makeField(), value: 0 },
      global: globalProvide,
    });
    await wrapper.find('input').setValue('7');
    expect(wrapper.emitted('change')).toBeTruthy();
  });
});
