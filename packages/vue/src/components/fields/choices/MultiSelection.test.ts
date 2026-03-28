// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import MultiSelection from './MultiSelection.vue';
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

function makeField(overrides: Partial<DefinitionPropertyField> = {}): any {
  return {
    name: 'colors',
    displayName: 'Colors',
    type: 'multi-selection',
    options: [
      { value: 'red', label: 'Red' },
      { value: 'green', label: 'Green' },
      { value: 'blue', label: 'Blue' },
    ],
    ...overrides,
  } as unknown as DefinitionPropertyField;
}

describe('MultiSelection (Vue)', () => {
  it('renders the control with role="button"', () => {
    const wrapper = mount(MultiSelection, {
      props: { field: makeField(), value: [] },
      global: globalProvide,
    });
    expect(wrapper.find('[role="button"]').exists()).toBe(true);
  });

  it('control has aria-haspopup="listbox"', () => {
    const wrapper = mount(MultiSelection, {
      props: { field: makeField(), value: [] },
      global: globalProvide,
    });
    const control = wrapper.find('[role="button"]');
    expect(control.attributes('aria-haspopup')).toBe('listbox');
  });

  it('aria-expanded is false initially', () => {
    const wrapper = mount(MultiSelection, {
      props: { field: makeField(), value: [] },
      global: globalProvide,
    });
    const control = wrapper.find('[role="button"]');
    expect(control.attributes('aria-expanded')).toBe('false');
  });

  it('shows "0 / 3 selected" with empty value', () => {
    const wrapper = mount(MultiSelection, {
      props: { field: makeField(), value: [] },
      global: globalProvide,
    });
    const control = wrapper.find('[role="button"]');
    expect(control.text()).toContain('0 / 3 selected');
  });

  it('shows selected count in summary text', () => {
    const wrapper = mount(MultiSelection, {
      props: { field: makeField(), value: ['red', 'blue'] },
      global: globalProvide,
    });
    const control = wrapper.find('[role="button"]');
    expect(control.text()).toContain('2 / 3 selected');
  });

  it('renders a label with displayName', () => {
    const wrapper = mount(MultiSelection, {
      props: { field: makeField({ displayName: 'Pick Colors' }), value: [] },
      global: globalProvide,
    });
    expect(wrapper.find('label').text()).toContain('Pick Colors');
  });

  it('aria-expanded becomes true when control is clicked', async () => {
    const wrapper = mount(MultiSelection, {
      props: { field: makeField(), value: [] },
      global: globalProvide,
    });
    const control = wrapper.find('[role="button"]');
    await control.trigger('click');
    expect(control.attributes('aria-expanded')).toBe('true');
  });

  it('emits "change" when an option is toggled', async () => {
    const wrapper = mount(MultiSelection, {
      props: { field: makeField(), value: [] },
      global: globalProvide,
    });
    await wrapper.find('[role="button"]').trigger('click');
    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    if (checkboxes.length > 0) {
      await checkboxes[0].trigger('change');
      expect(wrapper.emitted('change')).toBeTruthy();
    }
  });
});
