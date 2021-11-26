import { Box, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React from 'react'
import { PageScaffold } from '../../components/PageScaffold'
import { WithAuthProps } from '../../components/withAuth'

interface Props extends WithAuthProps {}

const Student: React.FC<Props> = ({ self }) => {
  const router = useRouter()
  const { id } = router.query

  return (
    <PageScaffold role={self.role}>
      <Box>
        <Text>Schüler id: {id}</Text>
      </Box>
    </PageScaffold>
  )
}

export default Student
