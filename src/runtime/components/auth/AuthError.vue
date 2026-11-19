<script lang="ts" setup>
import { computed } from '#imports';
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import type { AuthError } from '../../composables/useAuth';

const props = defineProps({
  error: { type: Object as PropType<AuthError>, required: true },
});

const emit = defineEmits({
  logout: null,
  retry: null,
});

const { t } = useI18n({ useScope: 'local' });

const isDenied = computed(() => [401, 403].includes(props.error.status as number));

const isOrganization = computed(() => props.error.stage === 'organization'); // public apps fail here without a session

const isCallback = computed(() => props.error.stage === 'callback'); // the login itself failed, retry starts a new one

const title = computed(() => {
  if (isDenied.value) return t('deniedTitle');

  return isOrganization.value ? t('organizationTitle') : t('sessionTitle');
});

const description = computed(() => {
  if (isDenied.value) return t('deniedDescription');

  if (isCallback.value) return t('callbackDescription');

  return isOrganization.value ? t('organizationDescription') : t('sessionDescription');
});

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
      <BButton variant="primary" @click="emit('retry')">
        <span v-text="t('retry')" />
      </BButton>

      <BButton variant="light" @click="emit('logout')">
        <span v-text="t('logout')" />
      </BButton>
    </div>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "callbackDescription": "Something failed while completing your sign-in.",
    "deniedDescription": "You signed in successfully, but this account is not allowed to access this application.",
    "deniedTitle": "Access denied",
    "logout": "Sign in with another account",
    "organizationDescription": "Something failed while loading the organization of this application.",
    "organizationTitle": "We could not load this organization",
    "retry": "Try again",
    "sessionDescription": "You signed in successfully, but something failed while preparing your session.",
    "sessionTitle": "We could not start your session"
  },
  "es": {
    "callbackDescription": "Algo falló al completar tu inicio de sesión.",
    "deniedDescription": "Iniciaste sesión, pero esta cuenta no tiene acceso a esta aplicación.",
    "deniedTitle": "Acceso denegado",
    "logout": "Entrar con otra cuenta",
    "organizationDescription": "Algo falló al cargar la organización de esta aplicación.",
    "organizationTitle": "No pudimos cargar esta organización",
    "retry": "Intentar de nuevo",
    "sessionDescription": "Iniciaste sesión, pero algo falló al preparar tu sesión.",
    "sessionTitle": "No pudimos iniciar tu sesión"
  },
  "pt": {
    "callbackDescription": "Algo falhou ao concluir o seu login.",
    "deniedDescription": "Você entrou, mas esta conta não tem acesso a esta aplicação.",
    "deniedTitle": "Acesso negado",
    "logout": "Entrar com outra conta",
    "organizationDescription": "Algo falhou ao carregar a organização desta aplicação.",
    "organizationTitle": "Não foi possível carregar esta organização",
    "retry": "Tentar de novo",
    "sessionDescription": "Você entrou, mas algo falhou ao preparar a sua sessão.",
    "sessionTitle": "Não foi possível iniciar a sua sessão"
  }
}
</i18n>
