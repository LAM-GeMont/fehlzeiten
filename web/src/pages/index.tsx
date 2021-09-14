import { Heading } from '@chakra-ui/react'
import { usePingQuery } from '../generated/graphql'

const Index = () => {

  const res = usePingQuery()
  console.log(res)

  return (
    <Heading p={10}>
      Lifesign: { res?.data?.ping }
    </Heading>
  )
}

export default Index
