<script lang="ts" setup>
import { useDropZone, useFileDialog } from '@vueuse/core';
import { filesize } from 'filesize';
import { computed, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

export interface InputDropzoneRejection {
  file: File;
  reason: 'type' | 'size';
}

// Dumb file picker: drop or click, validates and emits the files; uploading is up to the consumer
const props = defineProps({
  accept: { type: Array<string>, default: () => [] }, // MIME types, e.g. image/png; empty accepts anything
  disabled: { type: Boolean, default: false },
  hint: { type: String, default: undefined },
  maxSize: { type: Number, default: 0 }, // bytes; 0 means no limit
  multiple: { type: Boolean, default: false },
  title: { type: String, default: undefined },
});

const emit = defineEmits<{
  reject: [rejections: InputDropzoneRejection[]];
  select: [files: File[]];
}>();

const { t } = useI18n({ useScope: 'local' });

const dropZone = useTemplateRef<HTMLDivElement>('dropZone');

const titleText = computed(() => props.title ?? t(props.multiple ? 'titleMany' : 'title'));
const hintText = computed(() => props.hint ?? (props.maxSize ? t('hint', { size: filesize(props.maxSize) }) : ''));

const { open, onChange } = useFileDialog({ accept: props.accept.join(','), multiple: props.multiple, reset: true });

onChange(files => pick(files ? [...files] : []));

const { isOverDropZone } = useDropZone(dropZone, {
  multiple: props.multiple,
  onDrop: files => pick(files ?? []),
  preventDefaultForUnhandled: true,
});

function reasonOf(file: File): InputDropzoneRejection['reason'] | undefined {
  if (props.accept.length && !props.accept.includes(file.type)) return 'type';
  if (props.maxSize && file.size > props.maxSize) return 'size';
}

function pick(files: File[]) {
  if (props.disabled || !files.length) return;

  const checked = (props.multiple ? files : files.slice(0, 1)).map(file => ({ file, reason: reasonOf(file) }));
  const rejections = checked.filter((it): it is InputDropzoneRejection => Boolean(it.reason));
  const accepted = checked.filter(it => !it.reason).map(it => it.file);

  if (rejections.length) emit('reject', rejections);
  if (accepted.length) emit('select', accepted);
}

function openDialog() {
  if (!props.disabled) open();
}

defineExpose({ open: openDialog });
</script>

<template>
  <div
      ref="dropZone"
      :class="{ 'dz-drag-hover': isOverDropZone, 'opacity-50 pe-none': props.disabled }"
      class="dropzone dz-clickable text-start"
      @click="openDialog()">
    <slot :dragging="isOverDropZone" :open="openDialog">
      <div class="dz-message needsclick">
        <i class="ki-duotone ki-file-up text-primary fs-3x">
          <span class="path1" />
          <span class="path2" />
        </i>

        <div class="ms-4">
          <h3 class="fs-5 fw-bold text-gray-900 mb-1" v-text="titleText" />

          <span v-if="hintText" class="fs-7 fw-semibold text-gray-500" v-text="hintText" />
        </div>
      </div>
    </slot>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "hint": "Up to {size}",
    "title": "Drop a file here or click to choose",
    "titleMany": "Drop files here or click to choose"
  },
  "pt": {
    "hint": "Até {size}",
    "title": "Solte um arquivo aqui ou clique para escolher",
    "titleMany": "Solte os arquivos aqui ou clique para escolher"
  }
}
</i18n>
