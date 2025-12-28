<script lang="ts" setup>
import { MyCustomAdapter } from '@/adapters/custom.adapter';

const isOk = ref(false);
const isDanger = ref(true);

const { data, error, loading, meta, execute } = MyCustomAdapter(() => ({
  onBeforeSend: (params) => console.log('page onBeforeSend', params),
  onComplete: (result) => console.log('page onComplete', result),
  onSuccess: (result) => console.log('page onSuccess', result),
  params: { isOk: isOk.value, isDanger: isDanger.value },
}));
</script>

<template>
  <BContainer>
    <BButton :disabled="loading" @click="execute()">useadapter</BButton>

    <BFormGroup label="isOk">
      <BFormCheckbox v-model="isOk" switch />
    </BFormGroup>

    <hr>

    <BFormGroup label="isDanger">
      <BFormCheckbox v-model="isDanger" switch />
    </BFormGroup>

    <pre v-text="{ loading, error, meta, data }" />
  </BContainer>
</template>
