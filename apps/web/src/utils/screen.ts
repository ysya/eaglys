import { useBreakpoints } from '@vueuse/core'

const screens = {
  sm: 600,
  md: 1024,
  lg: 1440,
  xl: 1920,
  '2xl': 2100,
}

export function useScreen() {
  const b = useBreakpoints(screens)
  return {
    ...b,
  }
}
