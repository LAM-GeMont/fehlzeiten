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

const isAuthorized = (data, roles) => data?.self != null && (roles == null || roles.includes(data.self.role))

export interface WithAuthProps {
  self: Omit<User, 'tutoriums' | 'submittedAbsences' | 'submittedExcuses'>
}

const WithAuth = (Component: React.FC<WithAuthProps>, options?: Options) => {
  const returnValue = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data, loading } = useSelfQuery()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const router = useRouter()

    const { roles = null, redirectTo = '/login', redirectAuthorized = false } = options || {}

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!loading && !isAuthorized(data, roles) === !redirectAuthorized) {
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
        {!loading && isAuthorized(data, roles) === !redirectAuthorized && (
          <Component self={data?.self} />
        )}
      </>
    )
  }
  returnValue.displayName = Component.displayName
  return returnValue
}

export default WithAuth
