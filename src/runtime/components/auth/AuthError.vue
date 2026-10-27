<script lang="ts" setup>
import type { PropType } from 'vue';
import { computed } from 'vue';
import type { AuthError } from '../../composables/useAuth';

const props = defineProps({
  error: { type: Object as PropType<AuthError>, required: true },
});

const emit = defineEmits<(e: 'logout' | 'retry') => void>();

const isDenied = computed(() => [401, 403].includes(props.error.status as number));

const title = computed(() => isDenied.value ? 'Access denied' : 'We could not start your session');

const description = computed(() => isDenied.value
  ? 'You signed in successfully, but this account is not allowed to access this application.'
  : 'You signed in successfully, but something failed while preparing your session.');

const details = computed(() => [props.error.stage, props.error.status, props.error.url]
  .filter(Boolean)
  .join(' · '));
</script>

<template>
  <div class="d-flex flex-column justify-content-center align-items-center text-center gap-3 min-vh-100 p-5">
    <h1 class="h3 mb-0" v-text="title" />

    <p class="text-muted mb-0" v-text="description" />

    <code class="small" v-text="details" />

    <p class="small text-danger mb-0" v-text="props.error.message" />

    <div class="d-flex gap-3">
      <BButton v-if="props.error.stage !== 'callback'" variant="primary" @click="emit('retry')">
        <span v-text="'Retry'" />
      </BButton>

      <BButton variant="light" @click="emit('logout')">
        <span v-text="'Sign in with another account'" />
      </BButton>
    </div>
  </div>
</template>
