// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import SwitchInput from './SwitchInput.vue';
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
  return { name: 'notify', displayName: 'Enable Notifications', type: 'boolean', ...overrides } as DefinitionPropertyField;
}

describe('SwitchInput (Vue)', () => {
  it('renders [data-testid="switch"] element', () => {
    const wrapper = mount(SwitchInput, {
      props: { field: makeField(), value: false },
      global: globalProvide,
    });
    expect(wrapper.find('[data-testid="switch"]').exists()).toBe(true);
  });

  it('aria-checked is false when value=false', () => {
    const wrapper = mount(SwitchInput, {
      props: { field: makeField(), value: false },
      global: globalProvide,
    });
    const sw = wrapper.find('[data-testid="switch"]');
    expect(sw.attributes('aria-checked')).toBe('false');
  });

  it('aria-checked is true when value=true', () => {
    const wrapper = mount(SwitchInput, {
      props: { field: makeField(), value: true },
      global: globalProvide,
    });
    const sw = wrapper.find('[data-testid="switch"]');
    expect(sw.attributes('aria-checked')).toBe('true');
  });

  it('renders label containing field.displayName', () => {
    const wrapper = mount(SwitchInput, {
      props: { field: makeField({ displayName: 'Dark Mode' }), value: false },
      global: globalProvide,
    });
    expect(wrapper.text()).toContain('Dark Mode');
  });

  it('emits change(true) when checkbox triggers change from off', async () => {
    const wrapper = mount(SwitchInput, {
      props: { field: makeField(), value: false },
      global: globalProvide,
    });
    await wrapper.find('input[type="checkbox"]').trigger('change');
    expect(wrapper.emitted('change')?.[0]).toEqual([true]);
  });

  it('emits change(false) when checkbox triggers change from on', async () => {
    const wrapper = mount(SwitchInput, {
      props: { field: makeField(), value: true },
      global: globalProvide,
    });
    await wrapper.find('input[type="checkbox"]').trigger('change');
    expect(wrapper.emitted('change')?.[0]).toEqual([false]);
  });

  it('emits change on Space keydown on the switch span', async () => {
    const wrapper = mount(SwitchInput, {
      props: { field: makeField(), value: false },
      global: globalProvide,
    });
    await wrapper.find('[data-testid="switch"]').trigger('keydown.space');
    expect(wrapper.emitted('change')?.[0]).toEqual([true]);
  });
});
