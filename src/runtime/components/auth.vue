<script lang="ts" setup>
import { useNuxtApp, showError } from '#app';
import { callOnce } from '#imports';

const { $auth0 } = useNuxtApp();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'error', reason: string): void;
}>();

// Parseamos los query params directamente desde la URL
// (este componente asume ejecución en el cliente)
const params = new URLSearchParams(window.location.search);

const code = params.get('code') as string;
const error = params.get('error') as string;
const invitation = params.get('invitation') as string;
const organization = params.get('organization') as string;
const redirect = params.get('redirect') as string;

// Maneja el flujo de invitación a una organización
// Reenvía a Auth0 incluyendo organization + invitation
function handleInvite() {

  return $auth0.loginWithRedirect({ authorizationParams: { organization, invitation } });
}

// Maneja errores OAuth devueltos por Auth0
// Muestra el mensaje como error 400 en Nuxt
function handleError() {
  const errorDescription = params.get('error_description') ?? 'Auth error';

  emit('error', errorDescription);

  return showError({
    statusCode: 400,
    statusMessage: errorDescription,
  });
}

function handleCode() {
  return void $auth0.handleRedirectCallback()
    .then(() => emit('success'));
}

callOnce(async () => {
  // 1️⃣ Si viene una invitación, priorizamos ese flujo
  if (invitation && organization) {
    return handleInvite();
  }

  // 2️⃣ Si Auth0 devolvió un error OAuth
  if (error) {
    return handleError();
  }

  // 3️⃣ Si hay código de autorización OAuth
  if (code) {
    return handleCode();
  }

  // 4️⃣ Fallback: login estándar
  return $auth0.loginWithRedirect({
    appState: { target: redirect || '/' },
  });
});
</script>

<template>
  <div class="d-flex gap-3 justify-content-center align-items-center h-100">
    <BSpinner variant="primary" />
    <span v-text="'Loading...'" />
  </div>
</template>
