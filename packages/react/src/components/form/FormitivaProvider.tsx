import * as React from 'react';
import type { FieldValidationMode, FormitivaProviderProps } from '@formitiva/core';
import { FormitivaContext } from '../../hooks/useFormitivaContext';
import {
  loadTranslationMaps,
  createTranslationFunction,
  buildFormStyle,
  buildFieldStyle,
  type TranslationMap
} from '@formitiva/core';
import { registerBaseComponents } from '../../core/registries/componentRegistry';
import { ensureBuiltinFieldTypeValidatorsRegistered } from '@formitiva/core';

// Import CSS variables if needed
import '@formitiva/core/styles/formitiva.css';

// Guard prevents double-registration in HMR and test environments that
// re-import modules multiple times.
let _formitivaInitialized = false;
function ensureFormitivaInitialized() {
  if (_formitivaInitialized) return;
  _formitivaInitialized = true;
  registerBaseComponents();
  ensureBuiltinFieldTypeValidatorsRegistered();
}

export type ReactFormitivaProviderProps = FormitivaProviderProps & {
  children?: React.ReactNode;
  defaultLanguage?: string;
  defaultTheme?: string;
  defaultLocalizeName?: string;
  className?: string;
  defaultDisplayInstanceName?: boolean;
  defaultFieldValidationMode?: FieldValidationMode;
};

/**
 * FormitivaProvider component - Context provider for Formitiva configuration
 * @param {FormitivaProviderProps} props - The component props
 * @param {ReactNode} props.children - Child components to wrap with context
 * @param {string} [props.definitionName] - Name of the form definition
 * @param {Record<string, unknown>} [props.defaultStyle] - Default styling configuration
 * @param {string} [props.defaultLanguage='en'] - Default language code for translations
 * @param {string} [props.defaultTheme='light'] - Default theme name
 * @param {string} [props.defaultLocalizeName] - Name of custom localization file
 * @param {FieldValidationMode} [props.defaultFieldValidationMode='onEdit'] - Field Validation mode
 * @param {string} [props.className='formitiva-container'] - CSS class name for the container
 * @param {boolean} [props.displayInstanceName] - Whether to display the instance name
 */
export const FormitivaProvider = ({
  children,
  definitionName = '',
  defaultStyle,
  defaultLanguage = 'en',
  defaultTheme = 'light',
  defaultLocalizeName = '',
  defaultFieldValidationMode = 'onEdit',
  className = 'formitiva-container',
  defaultDisplayInstanceName = true
}: ReactFormitivaProviderProps) => {
  ensureFormitivaInitialized();
  const providerDefinitionName = definitionName;
  const localizeName = defaultLocalizeName;
  const theme = defaultTheme;
  const language = defaultLanguage;

  // Make a stable defaultStyle object so effects that depend on it don't
  // rerun every render when callers omit the prop ({} literal would be new each time)
  const stableDefaultStyle = React.useMemo(
    () => (defaultStyle ?? {}) as Record<string, unknown>,
    [defaultStyle]
  );

  // Keep common and user maps separate in state so updates trigger rerenders
  // and consumers pick up translations as soon as they load.
  const [commonMapState, setCommonMapState] = React.useState<TranslationMap>({});
  const [userMapState, setUserMapState] = React.useState<TranslationMap>({});

  // Initialize localization map (cancellable)
  React.useEffect(() => {
    let mounted = true;
    loadTranslationMaps(language, localizeName).then(({ commonMap, userMap }) => {
      if (!mounted) return;
      setCommonMapState(commonMap);
      setUserMapState(userMap);
    });
    return () => { mounted = false; };
  }, [language, localizeName]);

  // Initialize form and field style
  const formStyle = React.useMemo(() => buildFormStyle(stableDefaultStyle), [stableDefaultStyle]);
  const fieldStyle = React.useMemo(() => buildFieldStyle(stableDefaultStyle), [stableDefaultStyle]);

  // Memoize the underlying translation function so `t` is stable and cheap to call
  // translationFn is already stable (useMemo); use it directly as `t`.
  const t = React.useMemo(
    () => createTranslationFunction(language, commonMapState, userMapState),
    [language, commonMapState, userMapState]
  );

  const contextValue = React.useMemo(
    () => ({
      definitionName: providerDefinitionName,
      language,
      theme,
      formStyle,
      fieldStyle,
      t,
      fieldValidationMode: defaultFieldValidationMode,
      displayInstanceName: defaultDisplayInstanceName
    }),
    [ providerDefinitionName, language, theme, 
      fieldStyle, formStyle, t,
      defaultFieldValidationMode, defaultDisplayInstanceName ]
  );

  // Only apply height: 100% if the user provided a height in their style prop
  const wrapperStyle = stableDefaultStyle?.height ? { height: '100%' } : undefined;

  return (
    <FormitivaContext.Provider value={contextValue}>
      <div
        data-formitiva-theme={theme}
        className= {className}
        style={wrapperStyle}
      >
        {children}
      </div>
    </FormitivaContext.Provider>
  );
};

FormitivaProvider.displayName = 'FormitivaProvider';