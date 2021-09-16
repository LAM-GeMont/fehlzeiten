import { extendTheme } from '@chakra-ui/react'
import { createBreakpoints } from '@chakra-ui/theme-tools'

const fonts = { mono: `'Menlo', monospace` }

const breakpoints = createBreakpoints({
  sm: '40em',
  md: '52em',
  lg: '64em',
  xl: '80em',
})

const theme = extendTheme({
  colors: {
    black: '#16161D',
    primary: {
      50: "#E5F3FF",
      100: "#B8DFFF",
      200: "#8ACAFF",
      300: "#5CB5FF",
      400: "#2EA0FF",
      500: "#008BFF",
      600: "#006FCC",
      700: "#005399",
      800: "#003866",
      900: "#001C33"
    }
  },
  fonts,
  breakpoints,
})

export default theme
