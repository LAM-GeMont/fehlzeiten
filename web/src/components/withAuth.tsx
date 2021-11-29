import { Center } from "@chakra-ui/layout"
import { Spinner } from "@chakra-ui/spinner"
import { useRouter } from "next/router"
import React, { useEffect } from "react"
import { Role, SelfQuery, User, useSelfQuery } from "../generated/graphql"

interface Options {
  roles?: [Role]
  redirectTo?: string
  redirectAuthorized?: boolean
}

const isAuthorized = (data, roles, loading) => data?.self != null && (roles == null || roles.includes(data.self.role))

export interface WithAuthProps {
  self: Omit<User, "tutoriums">
}

const WithAuth = (Component: React.FC<WithAuthProps>, options?: Options) => {
  return ({}) => {
    const { data, loading } = useSelfQuery()
    const router = useRouter()

    const { roles = null, redirectTo = "/login", redirectAuthorized = false } = options || {}

    useEffect(() => {
      if (!loading && !isAuthorized(data, roles, loading) == !redirectAuthorized) {
        router.replace(redirectTo)
      }

    }, [loading, data, router])

    return (
      <>
        {loading && (
          <Center h="100vh" w="100vw">
            <Spinner />
          </Center>
        )}
        {!loading && isAuthorized(data, roles, loading) == !redirectAuthorized && (
          <Component self={data?.self} />
        )}
      </>
    )
  }
}

export default WithAuth;
