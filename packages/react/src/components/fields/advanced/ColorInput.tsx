import * as React from "react";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from '@formitiva/core';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../../hooks/useFieldValidator";

type ColorOption = {
  label: string;
  value: string;
};

export type ColorInputProps = BaseInputProps<string, DefinitionPropertyField>;

const predefinedColors: ColorOption[] = [
  { label: "Black", value: "#000000" },
  { label: "White", value: "#ffffff" },
  { label: "Red", value: "#ff0000" },
  { label: "Green", value: "#008000" },
  { label: "Blue", value: "#0000ff" },
  { label: "Yellow", value: "#ffff00" },
  { label: "Cyan", value: "#00ffff" },
  { label: "Magenta", value: "#ff00ff" },
  { label: "Orange", value: "#ffa500" },
  { label: "Purple", value: "#800080" },
  { label: "Brown", value: "#a52a2a" },
  { label: "Gray", value: "#808080" },
  { label: "Light Gray", value: "#d3d3d3" },
  { label: "Pink", value: "#ffc0cb" },
];

const HEX_REGEX = /^#([0-9A-F]{3}){1,2}$/i;
const DEFAULT_COLOR = "#000000";

const isValidHexColor = (color: string) => HEX_REGEX.test(color);

const normalizeHexColor = (color?: string): string => {
  if (!color || !isValidHexColor(color)) return DEFAULT_COLOR;

  const c = color.toLowerCase();
  if (c.length === 4) {
    return (
      "#" +
      c.slice(1)
       .split("")
       .map((x) => x + x)
       .join("")
    );
  }
  return c;
};

const toRGB = (hex: string) => {
  const value = parseInt(hex.slice(1), 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

/**
 * ColorInput Component
 * * ---------------------
 * A reusable color input field that supports a predefined list of color options
 * (e.g., Red, Blue, etc.) and also allows the user to choose a custom color via
 * a native HTML `<input type="color">`.
 * 
 */
const ColorInput: React.FC<ColorInputProps> = ({
  field,
  value,
  onChange,
  onError,
  error: externalError,
}) => {
  const { t } = useFormitivaContext();
  const validate = useFieldValidator(field, externalError);
  
  const normalizedValue = React.useMemo(
    () => normalizeHexColor(value),
    [value]
  );

  const { inputRef, error, handleChange, handleBlur } =
    useUncontrolledValidatedInput({
      value: normalizedValue,
      onChange,
      onError,
      validate,
    });

  const [previewColor, setPreviewColor] =
    React.useState(normalizedValue);
  
  React.useEffect(() => {
    setPreviewColor(normalizedValue);
  }, [normalizedValue]);

  const handleColorChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const color = normalizeHexColor(e.target.value);
      setPreviewColor(color);
      handleChange({
        target: { value: color } as HTMLInputElement,
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    },
    [handleChange]
  );

  const handleSelectChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const color = normalizeHexColor(e.target.value);
      setPreviewColor(color);
      handleChange({
        target: { value: color } as HTMLInputElement,
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    },
    [handleChange]
  );

  const predefinedMap = React.useMemo(
    () => new Set(predefinedColors.map((c) => c.value)),
    []
  );

  const isPredefined = predefinedMap.has(previewColor);
  const { r, g, b } = React.useMemo(
    () => toRGB(previewColor),
    [previewColor]
  );

  return (
    <StandardFieldLayout field={field} error={error}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
        }}
      >
        <select
          id={field.name}
          value={previewColor}
          onChange={handleSelectChange}
          onBlur={handleBlur}
          className={combineClasses(
            CSS_CLASSES.input,
            CSS_CLASSES.inputSelect
          )}
          aria-invalid={!!error}
        >
          {predefinedColors.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.label)}
            </option>
          ))}
          {!isPredefined && (
            <option value={previewColor}>
              ({r}, {g}, {b})
            </option>
          )}
        </select>

        <label
          style={{
            width: "2.5em",
            height: "1.8em",
            border: "1px solid #ccc",
            borderRadius: 4,
            backgroundColor: previewColor,
            cursor: "pointer",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            id={`${field.name}-color`}
            type="color"
            defaultValue={previewColor}
            onChange={handleColorChange}
            onBlur={handleBlur}
            style={{ opacity: 0, width: "100%", height: "100%" }}
            aria-invalid={!!error}
          />
        </label>
      </div>
    </StandardFieldLayout>
  );
};

ColorInput.displayName = "ColorInput";
export default React.memo(ColorInput);
