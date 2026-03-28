import * as React from "react";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
  FieldValueType,
  ErrorType,
} from '@formitiva/core';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { CSS_CLASSES } from '@formitiva/core';
import { getButtonHandler } from '@formitiva/core';

/**
 * Extended props for Button component
 * Unlike other fields, Button needs access to all form values
 * and the ability to change any field
 */
export interface ButtonInputProps extends BaseInputProps<null, DefinitionPropertyField> {
  valuesMap: Record<string, FieldValueType>;
  handleChange: (fieldName: string, value: FieldValueType) => void;
  handleError: (fieldName: string, error: ErrorType) => void;
}

/**
 * Button component for form actions
 * Buttons can execute custom handlers that can read and modify form values
 */
const Button: React.FC<ButtonInputProps> = ({
  field,
  valuesMap,
  handleChange,
  handleError,
}) => {
  const { t } = useFormitivaContext();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [buttonError, setButtonError] = React.useState<string | null>(null);

  const handleClick = React.useCallback(async () => {
    if (!field.action) {
      console.warn(`Button "${field.name}" has no action defined`);
      return;
    }

    const handler = getButtonHandler(field.action);
    if (!handler) {
      const errorMsg = `Button handler "${field.action}" not found`;
      console.error(errorMsg);
      setButtonError(errorMsg);
      return;
    }

    setIsProcessing(true);
    setButtonError(null);

    try {
      await handler(valuesMap, handleChange, handleError, t);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Button handler "${field.action}" failed:`, errorMsg);
      setButtonError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [field, valuesMap, handleChange, handleError, t]);

  const baseButtonStyle: React.CSSProperties = {
    cursor: isProcessing ? "wait" : "pointer",
    opacity: isProcessing ? 0.6 : 1,
  };

  const mergedStyle: React.CSSProperties = { ...baseButtonStyle };

  // Support flexible width: number => pixels, string => CSS size
  if (field.width) {
    if (typeof field.width === 'number') {
      if (field.width > 0) mergedStyle.width = `${field.width}px`;
    } else if (typeof field.width === 'string' && field.width.trim() !== "") {
      mergedStyle.width = field.width;
    }
  }

  // Determine alignment: left | center | right. Default to 'right' for backwards compatibility
  const alignment = (field.alignment || 'right') as 'left' | 'center' | 'right';

  // Build children according to alignment. For 'right', rely on StandardFieldLayout's rightAlign.
  const buttonElement = (
    <button
      type="button"
      className={CSS_CLASSES.button}
      onClick={handleClick}
      disabled={isProcessing}
      aria-label={t(field.buttonText || field.displayName)}
      aria-busy={isProcessing}
      style={mergedStyle}
    >
      {isProcessing ? t("Processing...") : t(field.buttonText || field.displayName)}
    </button>
  );

  // Choose how to pass children to the layout based on alignment
  if (alignment === 'right') {
    return (
      <StandardFieldLayout field={field} rightAlign={true} error={buttonError}>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>{buttonElement}</div>
      </StandardFieldLayout>
    );
  }

  if (alignment === 'center') {
    return (
      <StandardFieldLayout field={field} rightAlign={false} error={buttonError}>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>{buttonElement}</div>
      </StandardFieldLayout>
    );
  }

  // left alignment (default fallback)
  return (
    <StandardFieldLayout field={field} rightAlign={false} error={buttonError}>
      <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-start' }}>{buttonElement}</div>
    </StandardFieldLayout>
  );
};

Button.displayName = "Button";
export default React.memo(Button);
