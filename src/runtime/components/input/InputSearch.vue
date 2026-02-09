<script lang="ts" setup>
import FormatIcon from '../format/FormatIcon.vue';

const search = defineModel({ type: String, default: () => String() });
</script>

<template>
  <div class="d-flex align-items-center position-relative">
    <BFormInput v-model="search" class="form-control-solid border" placeholder="Search..." />

    <FormatIcon class="position-absolute me-3 end-0" mode="regular" name="search" size="4" variant="primary" />
  </div>
</template>
