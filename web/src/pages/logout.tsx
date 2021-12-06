import { useApolloClient } from '@apollo/client'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useLogoutMutation } from '../generated/graphql'

interface LogoutProps {

}

const Logout: React.FC<LogoutProps> = () => {
  const router = useRouter()
  const client = useApolloClient()
  const [logout] = useLogoutMutation({
    onCompleted: () => client.cache.evict({ fieldName: 'self' }),
    refetchQueries: 'all'
  })

  useEffect(() => {
    logout().then(() => {
      router.push('/login')
    })
  })

  return (
    null
  )
}

export default Logout
