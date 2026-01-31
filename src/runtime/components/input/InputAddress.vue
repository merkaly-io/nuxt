<script lang="ts" setup>
import type { PropType } from 'vue';
import { onMounted, reactive, ref } from 'vue';
import { BFormInput } from 'bootstrap-vue-next';

export type PlaceTypes = 'address' | 'geocode' | 'establishment' | '(regions)' | '(cities)'

const emit = defineEmits<{
  (e: 'search', args: typeof address): void
  (e: 'error', place: any): void
}>();

const props = defineProps({
  mode: { type: String as PropType<PlaceTypes>, default: 'geocode' },
  countries: { type: Array<`${string}${string}`>, default: [] },
});

const model = defineModel({ type: String, default: () => '' });

const address = reactive({
  city: String(),
  code: String(),
  country: String(),
  latitude: Number(),
  line1: String(),
  locality: String(),
  longitude: Number(),
  name: String(),
  number: String(),
  state: String(),
  street: String(),
});

function setAddress(items: any[]) {
  const format = {
    city: ['locality', 'administrative_area_level_2'],
    code: ['postal_code'],
    country: ['country'],
    locality: ['sublocality', 'sublocality_level_1', 'political'],
    number: ['street_number'],
    state: ['administrative_area_level_1'],
    street: ['route'],
  };

  items.forEach(item => {
    const [name] = item.types;
    const value = item.short_name;

    for (const key in format) {
      //@ts-ignore
      const group: string[] = format[key];

      const exist = group.includes(name);

      if (!exist) {
        continue;
      }

      //@ts-ignore
      address[key] = value;
    }
  });

  return emit('search', { ...address });
}

const input = ref<typeof BFormInput>();

onMounted(() => {
  const { $gmap } = useNuxtApp();

  //@ts-ignore
  input.value.element.value = model.value;

  // @ts-ignore
  const autocomplete = new $gmap.places.Autocomplete(input.value?.element, {
    componentRestrictions: { country: props.countries },
    types: [props.mode],
  });

  // Listener for place selection
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();

    if (!place.geometry) {
      return emit('error', place);
    }

    const { lat, lng } = place.geometry.location;

    address.name = place.formatted_address;
    address.line1 = place.name;
    address.latitude = lat?.();
    address.longitude = lng?.();

    return setAddress(place.address_components);
  });
});
</script>

<template>
  <BFormInput ref="input" :model-value="address.name" autocomplete="one-time-code" placeholder="Search address" />
</template>
