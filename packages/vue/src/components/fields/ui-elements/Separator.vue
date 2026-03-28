<script setup lang="ts">
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { isDarkTheme } from '@formitiva/core';

interface FieldSeparatorProps {
  field: {
    color?: string;
    thickness?: number;
    margin?: string | number;
    label?: string;
    alignment?: "left" | "center" | "right";
  };
}

const props = defineProps<FieldSeparatorProps>();

const { theme } = useFormitivaContext();

const color = props.field.color || (isDarkTheme(theme ?? 'light') ? "#444444" : "#CCCCCC");
const thickness = props.field.thickness ?? 1;
const margin = props.field.margin ?? "8px 0";
</script>

<template>
  <div
    class="formitiva-separator"
    style="width: auto; height: 0;"
    :style="{
      borderTop: `${thickness}px solid ${color}`,
      margin: margin
    }"
  />
</template>
