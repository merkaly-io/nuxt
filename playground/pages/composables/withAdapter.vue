<script lang="ts" setup>
import { MyCustomAdapter } from '@/adapters/custom.adapter';

const isOk = ref(false);
const isDanger = ref(true);

const { data, error, loading, meta, execute } = MyCustomAdapter(() => ({
  params: { isOk: isOk.value, isDanger: isDanger.value },
  onBeforeSend: (params) => console.log('page onBeforeSend', params),
  onSuccess: (result) => console.log('page onSuccess', result),
  onComplete: (result) => console.log('page onComplete', result),
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
