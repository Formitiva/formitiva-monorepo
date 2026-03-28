// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ImageDisplay from './ImageDisplay.vue';
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
  return { name: 'logo', displayName: 'Logo', type: 'image', ...overrides } as DefinitionPropertyField;
}

const IMG_URL = 'https://example.com/image.png';

describe('ImageDisplay (Vue)', () => {
  it('renders an img element when a URL is provided', () => {
    const wrapper = mount(ImageDisplay, {
      props: { field: makeField(), value: IMG_URL },
      global: globalProvide,
    });
    expect(wrapper.find('img').exists()).toBe(true);
  });

  it('img alt comes from field.displayName', () => {
    const wrapper = mount(ImageDisplay, {
      props: { field: makeField({ displayName: 'Company Logo' }), value: IMG_URL },
      global: globalProvide,
    });
    expect(wrapper.find('img').element.alt).toBe('Company Logo');
  });

  it('img alt defaults to "Image" when displayName is empty', () => {
    const wrapper = mount(ImageDisplay, {
      props: { field: makeField({ displayName: '' }), value: IMG_URL },
      global: globalProvide,
    });
    expect(wrapper.find('img').element.alt).toBe('Image');
  });

  it('renders wrapper with data-testid="image-wrapper"', () => {
    const wrapper = mount(ImageDisplay, {
      props: { field: makeField(), value: IMG_URL },
      global: globalProvide,
    });
    expect(wrapper.find('[data-testid="image-wrapper"]').exists()).toBe(true);
  });

  it('renders nothing when no URL is provided and no defaultValue', () => {
    const wrapper = mount(ImageDisplay, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('img').exists()).toBe(false);
  });

  it('uses field.defaultValue when value is empty', () => {
    const wrapper = mount(ImageDisplay, {
      props: { field: makeField({ defaultValue: IMG_URL } as any), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('img').exists()).toBe(true);
  });
});
