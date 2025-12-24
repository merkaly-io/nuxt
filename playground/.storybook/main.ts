import type { StorybookConfig } from '@nuxtjs/storybook'; // not from '@storybook/core-common'

const config: StorybookConfig = {
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    // "@storybook/addon-vitest"
  ],
  framework: {
    name: '@storybook-vue/nuxt',
    options: {},
  },
  stories: [
    '../components/**/*.story.@(js|jsx|ts|tsx|mdx)',
  ],
};

export default config;
