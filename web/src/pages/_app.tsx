import { ChakraProvider } from '@chakra-ui/react'
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'

import theme from '../theme'
import { AppProps } from 'next/app'

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
  credentials: "include"
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider resetCSS theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </ApolloProvider>
  )
}

export default MyApp
