import * as React from "react";
import useFormitivaContext from "../../hooks/useFormitivaContext";
import { combineClasses, CSS_CLASSES } from '@formitiva/core';
import Tooltip from "../fields/base/Tooltip";
import type { DefinitionPropertyField } from '@formitiva/core';

const TooltipMemo = React.memo(Tooltip);

/**
 * ColumnFieldLayout - Vertical layout wrapper for form fields
 * 
 * This component provides a column-based layout pattern:
 * - Label on top (left-aligned or center-aligned based on labelLayout)
 * - Value/input area below
 * - Optional tooltip support
 * - Error display area
 * 
 * Usage:
 * <ColumnFieldLayout field={field} error={error}>
 *   <textarea ... />
 * </ColumnFieldLayout>
 */
export const ColumnFieldLayout = React.memo(({
  field,
  error,
  children,
  showLabel = true,
}: {
  field: DefinitionPropertyField;
  error?: string | null;
  children: React.ReactNode;
  showLabel?: boolean;
}) => {
  const { t } = useFormitivaContext();

  // Determine label alignment based on labelLayout
  const labelAlignment = field.labelLayout === 'column-center' ? 'center' : 'left';

  const rootStyle = React.useMemo<React.CSSProperties>(() => {
    const s: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--formitiva-label-gap, 4px)',
    };
    (s as Record<string, string>)['--label-align'] = labelAlignment;
    return s;
  }, [labelAlignment]);

  const labelStyle = React.useMemo<React.CSSProperties>(() => ({
    textAlign: labelAlignment as 'left' | 'center',
    width: '100%',
    minWidth: 'unset',
    display: 'block',
    marginBottom: '10px',
  }), [labelAlignment]);

  const rowStyle = React.useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--formitiva-inline-gap, 8px)',
    width: '100%',
  }), []);

  return (
    <div className={`${CSS_CLASSES.field} column-layout`} style={rootStyle}>
      {showLabel && (
        <label
          id={`${field.name}-label`}
          className={CSS_CLASSES.label}
          htmlFor={field.name}
          style={labelStyle}
        >
          {t(field.displayName)}
        </label>
      )}

      <div style={rowStyle}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {children}
        </div>
        {field.tooltip && <TooltipMemo content={field.tooltip} />}
      </div>

      {error && <ErrorDiv id={`${field.name}-error`}>{error}</ErrorDiv>}
    </div>
  );
});

ColumnFieldLayout.displayName = 'ColumnFieldLayout';

/**
 * RowFieldLayout - Horizontal layout wrapper for form fields
 * 
 * This component provides the traditional two-column layout pattern:
 * - Label on the left using CSS_CLASSES.label
 * - Value/input area on the right
 * - Optional tooltip support
 * - Error display area
 * 
 * Usage:
 * <RowFieldLayout field={field} error={error}>
 *   <input ... />
 * </RowFieldLayout>
 */
export const RowFieldLayout = React.memo(({
  field,
  error,
  children,
  rightAlign = false,
}: {
  field: DefinitionPropertyField;
  error?: string | null;
  children: React.ReactNode;
  rightAlign?: boolean;
}) => {
  const { t } = useFormitivaContext();

  return (
    <div className={`${CSS_CLASSES.field} row-layout`}>
      <label
        id={`${field.name}-label`}
        className={CSS_CLASSES.label}
        htmlFor={field.name}
        style={{ textAlign: 'left' }}
      >
        {t(field.displayName)}
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            {rightAlign ? (
              <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
                {children}
              </div>
            ) : (
              // left/center: children are rendered in the left flexible area; if the child itself centers
              // horizontally it should do so using its own wrapper (Button does this for 'center').
              <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-start' }}>{children}</div>
            )}
          </div>

          {field.tooltip && (
            <div style={{ marginLeft: 8, display: 'flex', alignItems: 'center' }}>
              <TooltipMemo content={field.tooltip} />
            </div>
          )}
        </div>

        {error && <ErrorDiv id={`${field.name}-error`}>{error}</ErrorDiv>}
      </div>
    </div>
  );
});

RowFieldLayout.displayName = 'RowFieldLayout';

/**
 * StandardFieldLayout - Smart layout wrapper that delegates to appropriate layout component
 * 
 * This component automatically chooses between row and column layouts based on field.labelLayout:
 * - Uses ColumnFieldLayout when field.labelLayout === 'column'
 * - Uses RowFieldLayout for default/row layout
 * - Maintains consistent API for all field components
 * 
 * Usage:
 * <StandardFieldLayout field={field} error={error}>
 *   <input ... />
 * </StandardFieldLayout>
 */
export const StandardFieldLayout = React.memo(({
  field,
  error,
  children,
  rightAlign = false,
}: {
  field: DefinitionPropertyField;
  error?: string | null;
  children: React.ReactNode;
  rightAlign?: boolean; // For checkbox, switch, etc.
}) => {
  // Use column layout if explicitly specified
  if (field.labelLayout === 'column-left' || field.labelLayout === 'column-center') {
    // For column layout, always show label
    return (
      <ColumnFieldLayout field={field} error={error} showLabel>
        {children}
      </ColumnFieldLayout>
    );
  }

  if (field.type === 'checkbox' || field.type === 'switch') {
    // For checkbox and switch, omit label in column layout
    return (
      <ColumnFieldLayout field={field} error={error} showLabel={false}>
        {children}
      </ColumnFieldLayout>
    );
  }

  // Default to row layout: 2 grid columns label + value
  return (
    <RowFieldLayout field={field} error={error} rightAlign={rightAlign}>
      {children}
    </RowFieldLayout>
  );
});

StandardFieldLayout.displayName = 'StandardFieldLayout';

export const ErrorDiv = React.memo(({ children, id }: { children: React.ReactNode; id?: string }) => {
  const style = React.useMemo<React.CSSProperties>(() => ({
    color: 'var(--formitiva-error-color, red)',
    fontSize: '13px',
    marginTop: '4px',
    fontWeight: 'var(--formitiva-font-weight)',
    display: "flex",
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    userSelect: "none",
  }), []);

  return <div id={id} style={style}>{children}</div>;
});

ErrorDiv.displayName = 'ErrorDiv';

/**
 * InstanceName - display and edit an instance name in a compact grid row
 *                on top of fields list
 *
 * Props:
 * - `name`: current instance name
 * - `onChange`: callback invoked with new name when edited
 */
export const InstanceName = React.memo(({ name, onChange }: { name: string; onChange: (n: string) => void }) => {
  const { t } = useFormitivaContext();

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, alignItems: 'center' }}>
        <label
          htmlFor="instance-name-input"
          style={{
            margin: 0,
            fontSize: '0.95em',
            fontWeight: 500,
            color: 'var(--formitiva-text-color, #333)'
          }}
        >
          {t('Instance Name')}
        </label>
        <input
          id="instance-name-input"
          type="text"
          value={name}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('Enter instance name')}
        />
      </div>
      <div style={{ height: '1px', backgroundColor: 'var(--formitiva-separator, #e6e6e6)', marginTop: 12, marginBottom: 12 }} />
    </div>
  );
});

InstanceName.displayName = 'InstanceName';
