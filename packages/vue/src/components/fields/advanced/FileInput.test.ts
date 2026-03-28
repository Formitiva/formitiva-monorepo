// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FileInput from './FileInput.vue';
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
  return { name: 'attachment', displayName: 'Attachment', type: 'file', ...overrides } as DefinitionPropertyField;
}

describe('FileInput (Vue)', () => {
  it('renders a drop zone with role="button"', () => {
    const wrapper = mount(FileInput, {
      props: { field: makeField(), value: null },
      global: globalProvide,
    });
    expect(wrapper.find('[role="button"]').exists()).toBe(true);
  });

  it('renders a hidden input[type="file"]', () => {
    const wrapper = mount(FileInput, {
      props: { field: makeField(), value: null },
      global: globalProvide,
    });
    expect(wrapper.find('input[type="file"]').exists()).toBe(true);
  });

  it('drop zone aria-label contains "Choose File" for single file', () => {
    const wrapper = mount(FileInput, {
      props: { field: makeField(), value: null },
      global: globalProvide,
    });
    const zone = wrapper.find('[role="button"]');
    expect(zone.attributes('aria-label')).toContain('Choose File');
  });

  it('drop zone aria-label contains "Choose Files" when field.multiple=true', () => {
    const wrapper = mount(FileInput, {
      props: { field: makeField({ multiple: true } as any), value: null },
      global: globalProvide,
    });
    const zone = wrapper.find('[role="button"]');
    expect(zone.attributes('aria-label')).toContain('Choose Files');
  });

  it('input[type="file"] has multiple attribute when field.multiple=true', () => {
    const wrapper = mount(FileInput, {
      props: { field: makeField({ multiple: true } as any), value: null },
      global: globalProvide,
    });
    const fileInput = wrapper.find('input[type="file"]').element as HTMLInputElement;
    expect(fileInput.multiple).toBe(true);
  });

  it('input[type="file"] id is field.name', () => {
    const wrapper = mount(FileInput, {
      props: { field: makeField({ name: 'doc' }), value: null },
      global: globalProvide,
    });
    expect(wrapper.find('input[type="file"]').element.id).toBe('doc');
  });

  it('renders a label with displayName', () => {
    const wrapper = mount(FileInput, {
      props: { field: makeField({ displayName: 'Upload Document' }), value: null },
      global: globalProvide,
    });
    expect(wrapper.find('label').text()).toContain('Upload Document');
  });
});
