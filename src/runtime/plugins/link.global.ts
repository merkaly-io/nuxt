import { defineComponent, h } from 'vue';
import { defineNuxtPlugin } from '#imports';
import { NuxtLink } from '#components';

// BLink renders NuxtLink with both `to` and `href` (bootstrap-vue-next#3316), NuxtLink warns E4010 and ignores href
const NuxtLinkWithoutHref = defineComponent({
  inheritAttrs: false,
  setup: (_, { attrs, slots }) => () => {
    const { href, ...linkAttrs } = attrs;

    return h(NuxtLink, linkAttrs.to ? linkAttrs : attrs, slots);
  },
});

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('MKNuxtLink', NuxtLinkWithoutHref); // BLink resolves its router component by name
});
