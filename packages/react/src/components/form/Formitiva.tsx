
import * as React from "react";
import FormitivaRenderer from "./FormitivaRenderer";
import { FormitivaProvider } from "./FormitivaProvider";
import { createInstanceFromDefinition } from '@formitiva/core';
import type { FormitivaDefinition, FormitivaProps } from '@formitiva/core';

function useNearestFormitivaTheme(ref: React.RefObject<HTMLElement | null>) {
  const [theme, setTheme] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!ref.current) return;
    // Walk up from the ref element to find the nearest ancestor that carries
    // a [data-formitiva-theme] attribute (set by the consumer's app wrapper).
    const themedNode = ref.current.closest('[data-formitiva-theme]') as Element | null;
    if (!themedNode) return;
    const read = () => setTheme(themedNode.getAttribute('data-formitiva-theme'));
    read();

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && (m as MutationRecord).attributeName === 'data-formitiva-theme') {
          read();
        }
      }
    });
    mo.observe(themedNode, { attributes: true, attributeFilter: ['data-formitiva-theme'] });
    return () => mo.disconnect();
  }, [ref]);
  return theme;
}

/**
 * Formitiva component - The main form rendering component
 * @param {FormitivaProps} props - The component props
 * @param {string | Record<string, unknown> | FormitivaDefinition} props.definitionData - Form definition data (JSON string, object, or FormitivaDefinition)
 * @param {FormitivaInstance} [props.instance] - Optional form instance with saved values
 * @param {string} [props.language] - Language code for localization
 * @param {string} [props.className] - Additional CSS class names
 * @param {string} [props.theme] - Theme name ('light' or 'dark')
 * @param {React.CSSProperties} [props.style] - Inline styles
 * @param {FieldValidationMode} [props.fieldValidationMode] - Field Validation mode ('onEdit', 'onBlur', 'onSubmission', 'realTime' [deprecated])
 * @param {boolean} [props.displayInstanceName] - Whether to display the instance name
 */
const Formitiva: React.FC<FormitivaProps> = ({
  definitionData,
  instance,
  language,
  className,
  theme,
  style, 
  fieldValidationMode: validationMode = 'onEdit',
  displayInstanceName = true,
  onSubmit = undefined,
  onValidation = undefined,
}) => {
    // Wrapper ref used by useNearestFormitivaTheme to walk up the DOM tree
    // and detect a consumer-applied [data-formitiva-theme] ancestor.
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const detectedTheme = useNearestFormitivaTheme(wrapperRef);
    const definition = React.useMemo<FormitivaDefinition | null>(() => {
      try {
        return typeof definitionData === 'string' ? JSON.parse(definitionData) : (definitionData ?? null);
      } catch {
        return null;
      }
    }, [definitionData]);
    const inputStyle = { fontSize: "inherit", fontFamily: "inherit", ...style };
    
    const inputTheme = theme ?? detectedTheme ?? 'light';

    const inputLanguage = language ?? 'en';

    React.useEffect(() => {
      // Add popup-root div if not already present to make sure popups work
      let root = document.getElementById('popup-root');
      if (!root) {
        root = document.createElement('div');
        root.id = 'popup-root';
        document.body.appendChild(root);
      }
    }, []);

    // Ensure we always have an instance to pass to the renderer. If the
    // caller didn't provide one, create a new instance from the definition.
    // We memoize this to prevent creating a new instance on every render,
    // which would reset the form state.
    const resolvedInstance = React.useMemo(() => {
      if (instance) return instance;
      if (!definition) return null;

      const created = createInstanceFromDefinition(definition, definition.name);
      if (!created.success || !created.instance) {
        return null;
      }
      return created.instance;
    }, [instance, definition]);

    if (!definition) {
      return <div style={{ color: 'red' }}>Error: No form definition provided.</div>;
    }

    if (!resolvedInstance) {
      return <div style={{ color: 'red' }}>Error: Failed to create instance from definition.</div>;
    }

    return (
      <div ref={wrapperRef} style={{ display: 'contents' }}>
        <FormitivaProvider
          definitionName={definition.name}
          defaultStyle={inputStyle}
          defaultLanguage={inputLanguage}
          defaultTheme={inputTheme}
          defaultLocalizeName={definition.localization || ""}
          className={className}
          defaultFieldValidationMode={validationMode}
          defaultDisplayInstanceName={displayInstanceName}
        >
          <FormitivaRenderer
            definition={definition}
            instance={resolvedInstance}
            onSubmit={onSubmit}
            onValidation={onValidation}
          />
        </FormitivaProvider>
      </div>
    );
};

Formitiva.displayName = 'Formitiva';

export default Formitiva;
