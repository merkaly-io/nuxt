<script lang="ts" setup>
import type { ComponentPublicInstance, PropType } from 'vue';
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { BFormInput } from 'bootstrap-vue-next';
import { useNuxtApp } from '#imports';

export type PlaceTypes = 'address' | 'geocode' | 'establishment' | '(regions)' | '(cities)'

export interface Address {
  city: string;
  code: string;
  country: string;
  latitude: number;
  line1: string;
  line2: string;
  locality: string;
  longitude: number;
  number: string;
  state: string;
  street: string;
}

interface PlaceResult {
  formatted_address?: string;
  name?: string;
  geometry?: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  address_components?: AddressComponent[];
}

interface AddressComponent {
  short_name: string;
  types: string[];
}

interface Autocomplete {
  getPlace: () => PlaceResult;
  addListener: (event: string, callback: () => void) => { remove: () => void };
}

type AddressFormatKey = keyof Pick<Address, 'city' | 'code' | 'country' | 'locality' | 'number' | 'state' | 'street'>;

const ADDRESS_FORMAT: Record<AddressFormatKey, string[]> = {
  city: ['locality', 'administrative_area_level_2'],
  code: ['postal_code'],
  country: ['country'],
  locality: ['sublocality', 'sublocality_level_1', 'political'],
  number: ['street_number'],
  state: ['administrative_area_level_1'],
  street: ['route'],
};

const emit = defineEmits<{
  (e: 'search', args: Address): void
  (e: 'error', place: PlaceResult): void
}>();

const props = defineProps({
  mode: { type: String as PropType<PlaceTypes>, default: 'geocode' },
  countries: { type: Array as PropType<string[]>, default: () => [] },
  placeholder: { type: String, default: 'Search address' },
  disabled: { type: Boolean, default: false },
});

const model = defineModel({ type: String, default: () => '' });

const address = reactive<Address>({
  city: '',
  code: '',
  country: '',
  latitude: 0,
  line1: '',
  line2: '',
  locality: '',
  longitude: 0,
  number: '',
  state: '',
  street: '',
});

const input = ref<ComponentPublicInstance<typeof BFormInput>>();

let placeChangedListener: { remove: () => void } | null = null;

function setAddress(items: AddressComponent[]) {
  for (const item of items) {
    const type = item.types[0];
    if (!type) continue;

    for (const key of Object.keys(ADDRESS_FORMAT) as AddressFormatKey[]) {
      if (ADDRESS_FORMAT[key].includes(type)) {
        address[key] = item.short_name;
        break;
      }
    }
  }

  emit('search', { ...address });
}

function getInputElement(): HTMLInputElement | null {
  return (input.value?.$el as HTMLInputElement) ?? null;
}

onMounted(() => {
  const { $gmap } = useNuxtApp();
  const inputElement = getInputElement();

  if (!inputElement) return;

  inputElement.value = model.value;

  const ac: Autocomplete = new $gmap.places.Autocomplete(inputElement, {
    componentRestrictions: props.countries.length ? { country: props.countries } : undefined,
    types: [props.mode],
  });

  placeChangedListener = ac.addListener('place_changed', () => {
    const place = ac.getPlace();

    if (!place.geometry) {
      return emit('error', place);
    }

    const { lat, lng } = place.geometry.location!;

    model.value = place.formatted_address ?? '';
    address.line1 = place.name ?? '';
    address.latitude = lat();
    address.longitude = lng();

    setAddress(place.address_components ?? []);
  });
});

onBeforeUnmount(() => {
  placeChangedListener?.remove();
  placeChangedListener = null;
});
</script>

<template>
  <BFormInput
    ref="input"
    :model-value="model"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    autocomplete="one-time-code"
  />
</template>
