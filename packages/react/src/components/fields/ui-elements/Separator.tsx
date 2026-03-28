import * as React from "react";
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { isDarkTheme } from '@formitiva/core';

interface SeparatorProps {
  color?: string;
  thickness?: number;
  margin?: string | number;
  label?: string | null;
  alignment?: "left" | "center" | "right";
}

// Currently this function is not used.
export const Separator: React.FC<SeparatorProps> = ({
  color = "#574d4dff",
  thickness = 1,
  margin = "8px 0",
  label,
  alignment = "center",
}) => {
  const { t } = useFormitivaContext();

  const hrStyle = {
    flex: 1,
    borderTop: `${thickness}px solid ${color}`,
    margin: 0,
  };

  return (
    <div style={{ margin }}>
      {label ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {alignment !== "right" && <hr style={hrStyle} />}
          <span style={{ whiteSpace: "nowrap", fontWeight: "bold", color }}>
            {t(label)}
          </span>
          {alignment !== "left" && <hr style={hrStyle} />}
        </div>
      ) : (
        <hr style={hrStyle} />
      )}
    </div>
  );
};

interface FieldSeparatorProps {
  field: {
    color?: string;
    thickness?: number;
    margin?: string | number;
    label?: string;
    alignment?: "left" | "center" | "right";
  };
  t: (text: string) => string;
}

const FieldSeparator: React.FC<FieldSeparatorProps> = ({ field }) => {
  const { theme } = useFormitivaContext();
  
  const {
    color = isDarkTheme(theme) ? "#444444" : "#CCCCCC",
    thickness = 1,
    margin = "8px 0",
  } = field;

  return (
    <div
      style={{
        width: "auto",
        height: "0", // ensures only 1 line
        borderTop: `${thickness}px solid ${color}`,
        margin,
      }}
    />
  );
};

FieldSeparator.displayName = "FieldSeparator";
export default React.memo(FieldSeparator);
