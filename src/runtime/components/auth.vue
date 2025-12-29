<script lang="ts" setup>
import { useNuxtApp, showError } from '#app';
import { callOnce } from '#imports';

const { $auth0 } = useNuxtApp();

// Parseamos los query params directamente desde la URL
// (este componente asume ejecución en el cliente)
const params = new URLSearchParams(window.location.search);

const invitation = params.get('invitation') as string;
const error = params.get('error') as string;
const code = params.get('code') as string;

// Maneja el flujo de invitación a una organización
// Reenvía a Auth0 incluyendo organization + invitation
function handleInvite() {
  const organization = params.get('organization') as string;

  return $auth0.loginWithRedirect({ authorizationParams: { organization, invitation } });
}

// Maneja errores OAuth devueltos por Auth0
// Muestra el mensaje como error 400 en Nuxt
function handleError() {
  const errorDescription = params.get('error_description') as string;

  return showError({
    statusMessage: errorDescription,
    statusCode: 400,
  });
}

function handleCode() {
  return $auth0.handleRedirectCallback();
}

callOnce(async () => {
  // 1️⃣ Si viene una invitación, priorizamos ese flujo
  if (invitation) {
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
  return $auth0.loginWithRedirect();
});
</script>

<template>
  <slot>
    <div class="d-flex gap-3 justify-content-center align-items-center h-100">
      <BSpinner variant="primary" />
      <span v-text="'Loading...'" />
    </div>
  </slot>
</template>
