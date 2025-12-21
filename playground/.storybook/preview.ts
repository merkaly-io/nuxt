import type { Preview } from '@nuxtjs/storybook'; // not from '@storybook/core-common'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
