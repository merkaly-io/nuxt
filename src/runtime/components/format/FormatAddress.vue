<script lang="ts" setup>
import PostalAddress from 'i18n-postal-address';

const props = defineProps({
  city: { type: String, default: () => String() },
  code: { type: String, default: () => String() },
  country: { type: String, default: () => String() },
  line1: { type: String, default: () => String() },
  line2: { type: String, default: () => String() },
  locality: { type: String, default: () => String() },
  state: { type: String, default: () => String() },
});

const address = new PostalAddress();

address
    .setAddress1(props.line1)
    .setAddress2(props.line2)
    .setState(props.state)
    .setRepublic(props.locality)
    .setCity(props.city)
    .setCountry(props.country)
    .setPostalCode(props.code);
</script>

<template>
  <address v-text="address.toString()" />
</template>

<style lang="scss" scoped>
address {
  margin: 0;
}
</style>
