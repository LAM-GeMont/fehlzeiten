import { Center } from '@chakra-ui/layout'
import { Spinner } from '@chakra-ui/spinner'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { Role, User, useSelfQuery } from '../generated/graphql'

interface Options {
  roles?: [Role]
  redirectTo?: string
  redirectAuthorized?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isAuthorized = (data, roles, loading) => data?.self != null && (roles == null || roles.includes(data.self.role))

export interface WithAuthProps {
  self: Omit<User, 'tutoriums'>
}

const WithAuth = (Component: React.FC<WithAuthProps>, options?: Options) => {
  // eslint-disable-next-line react/display-name
  return () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data, loading } = useSelfQuery()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const router = useRouter()

    const { roles = null, redirectTo = '/login', redirectAuthorized = false } = options || {}

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!loading && !isAuthorized(data, roles, loading) === !redirectAuthorized) {
        router.replace(redirectTo)
      }
    }, [loading, data, router, roles, redirectAuthorized, redirectTo])

    return (
      <>
        {loading && (
          <Center h="100vh" w="100vw">
            <Spinner />
          </Center>
        )}
        {!loading && isAuthorized(data, roles, loading) === !redirectAuthorized && (
          <Component self={data.self} />
        )}
      </>
    )
  }
}

export default WithAuth
