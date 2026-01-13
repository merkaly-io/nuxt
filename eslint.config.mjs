// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  ...storybook.configs["flat/recommended"],
  {
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
)
