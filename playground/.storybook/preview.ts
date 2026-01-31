import type { Preview } from '@nuxtjs/storybook';
import { BOrchestrator, BContainer } from 'bootstrap-vue-next';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (story) => ({
      components: { BOrchestrator, BContainer, story: story() },
      template: `
        <BOrchestrator />
        <BContainer class="py-4">
          <component :is="$options.components.story" />
        </BContainer>
      `,
    }),
  ],
};

export default preview;
