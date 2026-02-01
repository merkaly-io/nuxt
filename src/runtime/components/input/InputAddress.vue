<script lang="ts" setup>
import type { ComponentPublicInstance, PropType } from 'vue';
import { h, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { BFormInput, BInputGroup, BButton, useModal } from 'bootstrap-vue-next';
import { useNuxtApp } from '#imports';
import FormatIcon from '../format/FormatIcon.vue';
import ModalAddress from '../modal/ModalAddress.vue';

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
  name: string;
  number: string;
  state: string;
  street: string;
}

interface PlaceResult {
  formatted_address?: string;
  name?: string;
  geometry?: { location: { lat: () => number; lng: () => number; }; };
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
  name: '',
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

    address.line1 = place.name ?? '';
    address.latitude = lat();
    address.longitude = lng();

    setAddress(place.address_components ?? []);

    model.value = place.formatted_address;
    address.name = model.value;
  });
});

onBeforeUnmount(() => {
  placeChangedListener?.remove();
  placeChangedListener = null;
});

const { create: createModal } = useModal();

async function openAddressModal() {
  const editedAddress = reactive<Address>({ ...address });

  const result = await createModal({
    cancelTitle: 'Cancelar',
    okTitle: 'Guardar',
    size: 'lg',
    slots: {
      default: () => h(ModalAddress, {
        address: editedAddress,
        'onUpdate:address': (value: Address) => Object.assign(editedAddress, value),
      }),
    },
    title: 'Editar dirección',
  }).show();

  if (result.ok) {
    Object.assign(address, editedAddress);
    emit('search', { ...address });
  }
}
</script>

<template>
  <BInputGroup>
    <template #append>
      <BButton variant="light" class="border px-3" @click="openAddressModal()">
        <FormatIcon name="map-marker-alt" />
      </BButton>
    </template>

    <BFormInput ref="input" :model-value="model" v-bind="{ ...props, $attrs }" autocomplete="one-time-code" />
  </BInputGroup>
</template>
