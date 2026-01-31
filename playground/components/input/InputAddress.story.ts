import type { Meta, StoryObj } from '@nuxtjs/storybook';

import InputAddress from '../../../src/runtime/components/input/InputAddress.vue';

// More on how to set up stories at: https://storybook.js.org/docs/vue/writing-stories/introduction

const meta = {
  component: InputAddress,
  tags: ['autodocs'],
  args: {},
} satisfies Meta<typeof InputAddress>;

export default meta;
type Story = StoryObj<typeof meta>

export const Main: Story = {
  name: 'Default',
  args: {},
};
