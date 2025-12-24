import type { Meta, StoryObj } from '@nuxtjs/storybook';

import FormatMoney from '../../../src/runtime/components/format/FormatMoney.vue';

// More on how to set up stories at: https://storybook.js.org/docs/vue/writing-stories/introduction

const meta = {
  component: FormatMoney,
  tags: ['autodocs'],
  args: {
    value: 450,
  },
} satisfies Meta<typeof FormatMoney>;

export default meta;
type Story = StoryObj<typeof meta>

export const main: Story = {
  name: 'Default',
  args: {},
};
