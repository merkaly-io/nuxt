<script lang="ts" setup>
import FormatIcon from '../format/FormatIcon.vue';
</script>

<template>
  <div class="d-flex align-items-center position-relative">
    <BFormInput class="form-control-solid border" placeholder="Search..." />

    <FormatIcon class="position-absolute me-3 end-0" mode="regular" name="search" size="4" variant="primary" />
  </div>
</template>
