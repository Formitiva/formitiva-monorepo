<script setup lang="ts">
import { ref, computed, getCurrentInstance, watch } from 'vue';
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { BaseInputProps, DefinitionPropertyField } from '@formitiva/core';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { useFieldValidator } from "../../../hooks/useFieldValidator";
import { isDarkTheme } from '@formitiva/core';

export type FileInputProps = BaseInputProps<File | File[] | null, DefinitionPropertyField>;

const props = defineProps<FileInputProps>();

const emit = defineEmits<{
  change: [value: File | File[] | null];
  error: [error: string | null];
}>();

const _ctx = useFormitivaContext();
const t = computed(() => _ctx.t);
const isDarkMode = isDarkTheme(_ctx.theme ?? 'light');

const isDragging = ref(false);
const isHovering = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const error = ref<string | null>(null);
const prevError = ref<string | null>(null);

const validate = useFieldValidator(props.field, props.error);

const isDuplicateFile = (file: File, fileList: File[]) => {
  return fileList.some(
    (existing) =>
      existing.name === file.name &&
      existing.size === file.size &&
      existing.lastModified === file.lastModified
  );
};

const updateError = (next: string | null) => {
  if (next !== prevError.value) {
    prevError.value = next;
    error.value = next;
    emit('error', next);
  }
};

const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const input = target.files;
  let selected: File | File[] | null = null;

  if (input && input.length > 0) {
    const newFiles = Array.from(input);
    if (props.field.multiple) {
      const existingFiles = Array.isArray(props.value) ? props.value : [];
      const uniqueNewFiles = newFiles.filter(f => !isDuplicateFile(f, existingFiles));
      selected = [...existingFiles, ...uniqueNewFiles];
    } else {
      selected = newFiles[0];
    }
  }
  const err = validate(selected ?? [], "change");
  updateError(err);
  emit('change', selected);
  
  // Reset input value to allow selecting the same file again
  if (target) {
    target.value = '';
  }
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDragging.value = false;

  const droppedFiles = e.dataTransfer?.files;
  if (droppedFiles && droppedFiles.length > 0) {
    const newFiles = Array.from(droppedFiles);
    let selected: File | File[] | null = null;
    
    if (props.field.multiple) {
      const existingFiles = Array.isArray(props.value) ? props.value : [];
      const uniqueNewFiles = newFiles.filter(f => !isDuplicateFile(f, existingFiles));
      selected = [...existingFiles, ...uniqueNewFiles];
    } else {
      selected = newFiles[0];
    }
    
    const err = validate(selected, "change");
    updateError(err);
    emit('change', selected);
  }
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDragging.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDragging.value = false;
};

const handleRemoveFile = (index?: number) => {
  if (Array.isArray(props.value) && typeof index === 'number') {
    const newFiles = props.value.filter((_, i) => i !== index);
    const selected = newFiles.length > 0 ? newFiles : null;
    const err = validate(selected ?? [], "change");
    updateError(err);
    emit('change', selected);
  } else {
    const err = validate([], "change");
    updateError(err);
    emit('change', null);
  }
};

const handleBlur = () => {
  updateError(validate(props.value ?? [], "blur"));
};

const getInputElement = (): HTMLInputElement | null => {
  return (inputRef as { value?: HTMLInputElement | null }).value ?? null;
};

const handleClick = () => {
  const el = getInputElement();
  if (el) {
    try {
      el.click();
    } catch (err) {
      // Fallback: dispatch a MouseEvent if direct click() fails
      const evt = new MouseEvent('click', { bubbles: true, cancelable: true });
      el.dispatchEvent(evt);
    }
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    getInputElement()?.click();
  }
};

const files = computed(() => {
  return Array.isArray(props.value) ? props.value : props.value ? [props.value] : [];
});

const borderColor = computed(() => {
  if (isDragging.value) return 'var(--formitiva-color-primary, #2563eb)';
  if (isHovering.value) return 'var(--formitiva-border-hover, #4A4A4A)';
  if (error.value) return 'var(--formitiva-color-error, #ef4444)';
  return undefined;
});

const backgroundColor = computed(() => {
  if (isDragging.value) {
    return `var(--formitiva-bg-hover, ${isDarkMode ? '#070707' : '#eff6ff'})`;
  }
  return undefined;
});

const handleButtonMouseEnter = (e: MouseEvent) => {
  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--formitiva-bg-hover, #fee)';
};

const handleButtonMouseLeave = (e: MouseEvent) => {
  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
};
  // Sync composition ref with legacy data property for tests that rely on $data
  const _instance = getCurrentInstance?.();
  if (_instance) {
    watch(isDragging, (v) => {
      try {
        const proxy = _instance.proxy as unknown as { $data?: Record<string, unknown> } | undefined;
        if (proxy && proxy.$data) {
          proxy.$data.dragOver = v;
        }
      } catch { /* ignore */ }
    }, { immediate: true });
  }
</script>

<script lang="ts">
export default {
  data() {
    return { dragOver: false };
  }
};
</script>

<template>
  <StandardFieldLayout :field="field" :error="error">
    <div style="width: 100%;">
      <div
        class="formitiva-input formitiva-file-drop-zone"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @mouseenter="isHovering = true"
        @mouseleave="isHovering = false"
        @blur="handleBlur"
        @click="handleClick"
        @keydown="handleKeyDown"
        role="button"
        tabindex="0"
        :aria-label="field.multiple ? t('Choose Files or Drag & Drop') : t('Choose File or Drag & Drop')"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${field.name}-error` : undefined"
        style="
          position: relative;
          border-style: dashed;
          border-width: 1px;
          border-radius: var(--formitiva-border-radius, 4px);
          padding: 8px 12px;
          text-align: center;
          transition: all 0.2s ease;
          cursor: pointer;
          min-height: var(--formitiva-input-height, 34px);
          width: 100%;
          max-width: 100%;
          align-self: stretch;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          user-select: none;
        "
        :style="{ borderColor, backgroundColor }"
      >
        <input
          :id="field.name"
          ref="inputRef"
          type="file"
          :accept="field.accept"
          :multiple="field.multiple"
          style="position: absolute; opacity: 0; width: 1px; height: 1px; left: -9999px; pointer-events: none;"
          @change="handleChange"
        />
        
        <div style="font-size: 1.25rem; opacity: 0.6; line-height: 1; flex-shrink: 0;">
          📁
        </div>
        
        <div style="
          font-size: 0.875rem;
          font-weight: 400;
          color: var(--formitiva-text-color, #111827);
          flex: 1;
          text-align: left;
        ">
          {{ isDragging 
            ? t("Drop files here") 
            : field.multiple 
              ? t("Choose Files or Drag & Drop") 
              : t("Choose File or Drag & Drop")
          }}
        </div>
      </div>
      
      <div
        v-if="files.length > 0"
        style="
          margin-top: 8px;
          margin-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 200px;
          overflow-y: auto;
        "
      >
        <div
          v-for="(file, index) in files"
          :key="`${file.name}-${index}`"
          style="display: flex; gap: 8px; align-items: center;"
        >
          <span
            class="formitiva-input"
            :title="file.name"
            style="
              display: inline-block;
              padding: 6px 8px;
              background: var(--formitiva-input-bg, #fff);
              border: 1px solid var(--formitiva-border-color, #ccc);
              border-radius: 4px;
              flex: 1;
              min-width: 0;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            "
          >
            {{ file.name }}
          </span>
          <button
            type="button"
            @click="handleRemoveFile(field.multiple ? index : undefined)"
            :aria-label="t('Remove file')"
            @mouseenter="handleButtonMouseEnter"
            @mouseleave="handleButtonMouseLeave"
            style="
              background: transparent;
              border: none;
              color: var(--formitiva-color-error, #ef4444);
              cursor: pointer;
              padding: 2px 6px;
              font-size: 1.125rem;
              line-height: 1;
              border-radius: 4px;
              transition: background-color 0.2s;
              flex-shrink: 0;
            "
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </StandardFieldLayout>
</template>
