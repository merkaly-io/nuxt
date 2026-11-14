<script lang="ts" setup>
import { ref, useAuth } from '#imports';
import { useI18n } from 'vue-i18n';

// Mounted once by MKApp: the session ended while the app was open (refresh token revoked or rotated)
const { isExpired, relogin } = useAuth();
const { t } = useI18n({ useScope: 'local' });

const isRedirecting = ref(false);

function signIn() {
  isRedirecting.value = true;

  relogin().catch(() => (isRedirecting.value = false)); // stays open, the button can be pressed again
}
</script>

<template>
  <BModal :model-value="isExpired" :title="t('title')" centered no-close-on-backdrop no-close-on-esc no-header-close>
    <p class="mb-0" v-text="t('message')" />

    <template #footer>
      <BButton :loading="isRedirecting" variant="primary" @click="signIn">
        <span v-text="t('signIn')" />
      </BButton>
    </template>
  </BModal>
</template>

<i18n lang="json">
{
  "en": {
    "message": "For your security, sign in again to continue where you left off.",
    "signIn": "Sign in again",
    "title": "Your session expired"
  },
  "es": {
    "message": "Por tu seguridad, vuelve a entrar para continuar donde estabas.",
    "signIn": "Entrar de nuevo",
    "title": "Tu sesión expiró"
  },
  "pt": {
    "message": "Por segurança, entre novamente para continuar de onde parou.",
    "signIn": "Entrar novamente",
    "title": "Sua sessão expirou"
  }
}
</i18n>
