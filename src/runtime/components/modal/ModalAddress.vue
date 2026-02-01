<script lang="ts" setup>
import { reactive, watch } from 'vue';
import { BFormGroup, BFormInput, BRow, BCol } from 'bootstrap-vue-next';
import type { Address } from '../input/InputAddress.vue';

const props = defineProps<{
  address: Address;
}>();

const emit = defineEmits<{
  (e: 'update:address', value: Address): void;
}>();

const form = reactive<Address>({ ...props.address });

watch(form, (value) => emit('update:address', { ...value }), { deep: true });
</script>

<template>
  <BRow class="g-3">
    <BCol cols="12">
      <BFormGroup label="Address line 1" label-for="line1">
        <BFormInput id="line1" v-model="form.line1" />
      </BFormGroup>
    </BCol>

    <BCol cols="12">
      <BFormGroup label="Address line 2 (Apt, Suite, etc.)" label-for="line2">
        <BFormInput id="line2" v-model="form.line2" />
      </BFormGroup>
    </BCol>

    <BCol cols="6">
      <BFormGroup label="City" label-for="city">
        <BFormInput id="city" v-model="form.city" />
      </BFormGroup>
    </BCol>

    <BCol cols="6">
      <BFormGroup label="Locality" label-for="locality">
        <BFormInput id="locality" v-model="form.locality" />
      </BFormGroup>
    </BCol>

    <BCol cols="6">
      <BFormGroup label="State/Province" label-for="state">
        <BFormInput id="state" v-model="form.state" />
      </BFormGroup>
    </BCol>

    <BCol cols="6">
      <BFormGroup label="Postal code" label-for="code">
        <BFormInput id="code" v-model="form.code" />
      </BFormGroup>
    </BCol>

    <BCol cols="12">
      <BFormGroup label="Country" label-for="country">
        <BFormInput id="country" v-model="form.country" />
      </BFormGroup>
    </BCol>
  </BRow>
</template>
