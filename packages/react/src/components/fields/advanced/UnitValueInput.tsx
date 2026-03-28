import * as React from "react";
import type { BaseInputProps, DefinitionPropertyField } from '@formitiva/core';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import PopupOptionMenu from "../base/PopupOptionMenu";
import type { PopupOptionMenuPosition } from "../base/PopupOptionMenu";
import { getUnitFactors, convertTemperature } from '@formitiva/core';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useFieldValidator } from "../../../hooks/useFieldValidator";

type UnitValueInputProps = BaseInputProps<[string | number, string], DefinitionPropertyField>;

interface UnitOption {
  label: string;
  value: string;
  unit: string;
}

// Conversion Button Component
interface ConversionButtonProps {
  disabled: boolean;
  inputValue: string;
  selectedUnit: string;
  dimension: string;
  unitFactors: { units: string[]; factors: Record<string, number> };
  onConversionSelect: (option: UnitOption) => void;
  t: (key: string) => string;
}

const ConversionButton: React.FC<ConversionButtonProps> = React.memo(({
  disabled,
  inputValue,
  selectedUnit,
  dimension,
  unitFactors,
  onConversionSelect,
  t,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState<PopupOptionMenuPosition | null>(null);
  const [menuOptions, setMenuOptions] = React.useState<UnitOption[]>([]);

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      const parsedValue = parseFloat(inputValue);
      if (!Number.isFinite(parsedValue)) return;

      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({ x: rect.left, y: rect.bottom });

      // Generate conversion options
      const options: UnitOption[] = [];
      const isTemp = dimension === "temperature";

      if (isTemp) {
        unitFactors.units.forEach((toUnit) => {
          const converted = convertTemperature(selectedUnit, toUnit, parsedValue);
          if (Number.isFinite(converted)) {
            options.push({
              label: `${converted.toFixed(6)} ${t(toUnit)}`,
              value: converted.toString(),
              unit: toUnit,
            });
          }
        });
      } else {
        const fromFactor = unitFactors.factors[selectedUnit];
        if (fromFactor !== undefined) {
          Object.entries(unitFactors.factors).forEach(([toUnit, toFactor]) => {
            const converted = (parsedValue / fromFactor) * toFactor;
            if (Number.isFinite(converted)) {
              options.push({
                label: `${converted.toFixed(6)} ${t(toUnit)}`,
                value: converted.toString(),
                unit: toUnit,
              });
            }
          });
        }
      }

      setMenuOptions(options);
      setShowMenu(options.length > 0);
    },
    [disabled, inputValue, selectedUnit, dimension, unitFactors, t]
  );

  const handleSelect = React.useCallback(
    (option: UnitOption) => {
      setShowMenu(false);
      setMenuPosition(null);
      onConversionSelect(option);
    },
    [onConversionSelect]
  );

  const handleClose = React.useCallback(() => {
    setShowMenu(false);
    setMenuPosition(null);
  }, []);

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled}
        aria-disabled={disabled}
        style={{
          width: "var(--formitiva-unit-btn-width, 2.5em)",
          height: "auto",
          padding: "var(--formitiva-input-padding)",
          boxSizing: "border-box",
          border: "none",
          borderRadius: "var(--formitiva-button-border-radius, var(--formitiva-border-radius, 0.25em))",
          backgroundColor: disabled
            ? "var(--formitiva-button-disabled-bg, #cccccc)"
            : "var(--formitiva-button-bg, var(--formitiva-success-color))",
          color: "var(--formitiva-button-text, #ffffff)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "center",
          lineHeight: 1,
        }}
      >
        <span style={{ fontSize: "1em", pointerEvents: "none" }}>
          {'\u21C4'}
        </span>
      </button>

      {showMenu && menuOptions.length > 0 && (
        <PopupOptionMenu<UnitOption>
          pos={menuPosition}
          options={menuOptions}
          onClose={handleClose}
          onClickOption={handleSelect}
        />
      )}
    </>
  );
});

ConversionButton.displayName = "ConversionButton";

const UnitValueInput: React.FC<UnitValueInputProps> = ({ field, value, onChange, onError }) => {
  const { t } = useFormitivaContext();
  const validate = useFieldValidator(field);
  const [error, setError] = React.useState<string | null>(null);
  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef(onError);

  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const updateError = React.useCallback((next: string | null) => {
    if (next !== prevErrorRef.current) {
      prevErrorRef.current = next;
      setError(next);
      onErrorRef.current?.(next ?? null);
    }
  }, []);
  
  const dimension = field.dimension;

  // Load unit factors for this dimension
  const unitFactors = React.useMemo(() => {
    if (!dimension) return null;
    return getUnitFactors(dimension);
  }, [dimension]);

  // Parse current value
  const currentValue = String(value?.[0] ?? "");
  const currentUnit = String(value?.[1] ?? unitFactors?.default ?? "");

  // Controlled state
  const [inputValue, setInputValue] = React.useState(currentValue);
  const [selectedUnit, setSelectedUnit] = React.useState(currentUnit);

  // Sync with props
  React.useEffect(() => {
    setInputValue(currentValue);
  }, [currentValue]);

  React.useEffect(() => {
    setSelectedUnit(currentUnit);
  }, [currentUnit]);

  React.useEffect(() => {
    updateError(validate([inputValue, selectedUnit], "sync"));
  }, [inputValue, selectedUnit, updateError, validate]);

  // Handlers
  const handleValueChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      updateError(validate([newValue, selectedUnit], "change"));
      onChange?.([newValue, selectedUnit]);
    },
    [selectedUnit, validate, onChange, updateError]
  );

  const handleUnitChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newUnit = e.target.value;
      setSelectedUnit(newUnit);
      updateError(validate([inputValue, newUnit], "change"));
      onChange?.([inputValue, newUnit]);
    },
    [inputValue, validate, onChange, updateError]
  );

  const handleBlur = React.useCallback(() => {
    updateError(validate([inputValue, selectedUnit], "blur"));
  }, [inputValue, selectedUnit, updateError, validate]);

  const handleConversionSelect = React.useCallback(
    (option: UnitOption) => {
      setInputValue(option.value);
      setSelectedUnit(option.unit);
      onChange?.([option.value, option.unit]);
    },
    [onChange]
  );

  // Memoize unit options to avoid recreating on every render
  const unitOptions = React.useMemo(
    () => {
      if (!unitFactors) return [];
      return unitFactors.units.map((u) => (
        <option key={u} value={u}>
          {t(u)}
        </option>
      ));
    },
    [unitFactors, t]
  );

  if (!dimension || !unitFactors) return null;

  const disableConversion = Boolean(error) || !inputValue.trim();

  return (
    <StandardFieldLayout field={field} error={error}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--formitiva-unit-gap, 8px)", width: "100%" }}>
        <input
          id={field.name}
          type="text"
          value={inputValue}
          onChange={handleValueChange}
          onBlur={handleBlur}
          style={{ flex: "2 1 0" }}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
        />

        <select
          id={`${field.name}-unit`}
          value={selectedUnit}
          onChange={handleUnitChange}
          onBlur={handleBlur}
          style={{ flex: "1 1 0" }}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputSelect)}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
        >
          {unitOptions}
        </select>

        <ConversionButton
          disabled={disableConversion}
          inputValue={inputValue}
          selectedUnit={selectedUnit}
          dimension={dimension}
          unitFactors={unitFactors}
          onConversionSelect={handleConversionSelect}
          t={t}
        />
      </div>
    </StandardFieldLayout>
  );
};

UnitValueInput.displayName = "UnitValueInput";
export default React.memo(UnitValueInput);

