<script lang="ts" setup>
import { filesize } from 'filesize';

const props = defineProps({
  accept: { type: Array<string>, default: () => [] },
  multiple: { type: Boolean, default: false },
});

const dropZoneRef = ref<HTMLDivElement>();
const fileInputRef = ref<HTMLInputElement>();

const pictures = defineModel({ type: Array, default: () => [] });

const { isOverDropZone } = useDropZone(dropZoneRef, {
  dataTypes: props.accept,
  multiple: props.multiple,
  onDrop: handleFileChange,
  preventDefaultForUnhandled: false,
});

function removePicture(id: string) {
  pictures.value = pictures.value.filter(picture => picture._id !== id);
}

function triggerInput() {
  fileInputRef.value?.click();
}

function handleFileChange(files: File[]) {
  if (!files.length) return;

  const images = [...files].map(it => ({
    alt: it.name,
    id: crypto.randomUUID(),
    name: it.name,
    size: it.size,
    url: (URL.createObjectURL(it)),
  }));

  return pictures.value.push(...images);
}
</script>

<template>
  <div ref="dropZoneRef" :class="{'dz-drag-hover': isOverDropZone}" class="dropzone dz-clickable text-start">
    <input
        ref="fileInputRef"
        :accept="props.accept.join(',')"
        :multiple="props.multiple"
        class="d-none"
        type="file"
        @change="e => handleFileChange((e.target as HTMLInputElement).files)"
    />

    <div class="dz-message needsclick" @click="triggerInput">
      <i class="ki-duotone ki-file-up text-primary fs-3x">
        <span class="path1" />
        <span class="path2" />
      </i>

      <div class="ms-4">
        <h3 class="fs-5 fw-bold text-gray-900 mb-1">Drop files here or click to upload.</h3>
        <span class="fs-7 fw-semibold text-gray-400">Upload up to 10 files</span>
      </div>
    </div>

    <template v-for="picture in pictures" :key="picture._id">
      <div class="dz-preview border dz-image-preview">
        <div class="dz-image">
          <BImg :alt="picture.alt" :src="picture.url" class="w-100" />
        </div>

        <div class="dz-details">
          <div class="dz-size">
            <span v-text="filesize(picture.size)" />
          </div>

          <div class="dz-filename">
            <span v-text="picture.name" />
          </div>
        </div>

        <span class="dz-remove" @click="removePicture(picture._id)">
          <span>Remove file</span>
        </span>
      </div>
    </template>
  </div>
</template>
