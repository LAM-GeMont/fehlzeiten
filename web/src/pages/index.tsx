import { Heading } from '@chakra-ui/react'
import { PageScaffold } from '../components/PageScaffold'
import WithAuth, { WithAuthProps } from '../components/withAuth'

const Index: React.FC<WithAuthProps> = ({self}) => {

  return (
    <PageScaffold role={self.role}>

    </PageScaffold>
  )
}

export default WithAuth(Index)
