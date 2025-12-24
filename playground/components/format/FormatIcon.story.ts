import type { Meta, StoryObj } from '@nuxtjs/storybook';

import FormatIcon from '../../../src/runtime/components/format/FormatIcon.vue';

// More on how to set up stories at: https://storybook.js.org/docs/vue/writing-stories/introduction

const meta = {
  component: FormatIcon,
  tags: ['autodocs'],
  args: {
    name: 'home',
  },
} satisfies Meta<typeof FormatIcon>;

export default meta;
type Story = StoryObj<typeof meta>

export const main: Story = {
  name: 'Default',
  args: {},
};
