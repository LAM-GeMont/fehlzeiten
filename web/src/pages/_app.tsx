import { ChakraProvider } from '@chakra-ui/react'
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'

import theme from '../theme'
import { AppProps } from 'next/app'

const client = new ApolloClient({
  uri: process.env.BACKEND_URL,
  cache: new InMemoryCache(),
  credentials: 'include',
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network'
    }
  }
})

function MyApp ({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider resetCSS theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </ApolloProvider>
  )
}

export default MyApp
