import {
  defineConfig,
  presetWind,
  transformerCompileClass,
  transformerDirectives,
  transformerVariantGroup,
  type UserConfig,
} from 'unocss'

export default defineConfig({
  presets: [presetWind()],
  transformers: [
    transformerDirectives(),
    transformerCompileClass({
      // trigger: 'css',
      classPrefix: 'sp-',
    }),
    transformerVariantGroup(),
  ],
  shortcuts: {},
  theme: {
    container: {
      center: true,
      // padding: {
      //   DEFAULT: '1rem',
      //   sm: '2rem',
      //   lg: '5rem',
      //   xl: '12rem',
      //   '2xl': '6rem',
      // },
    },
    breakpoints: {
      xs: '100%',
      sm: '640px',
      md: '1024px',
      lg: '1440px',
      xl: '1920px',
    },
    colors: {
      primary: '#1E88E5',
    },
  },
}) as UserConfig
