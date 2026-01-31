import type { Meta, StoryObj } from '@nuxtjs/storybook';

import InputMoney from '../../../src/runtime/components/input/InputMoney.vue';

// More on how to set up stories at: https://storybook.js.org/docs/vue/writing-stories/introduction

const meta = {
  component: InputMoney,
  tags: ['autodocs'],
  args: {
    modelValue: 125,
    prefix: 'R$',
  },
} satisfies Meta<typeof InputMoney>;

export default meta;
type Story = StoryObj<typeof meta>

export const Main: Story = {
  name: 'Default',
  args: {
    modelValue: 1502,
    suffix: '',
    prefix: 'R$',
  },
};
