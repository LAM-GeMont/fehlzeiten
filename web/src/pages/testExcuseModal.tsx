import { useDisclosure } from '@chakra-ui/react'
import React from 'react'
import { PageScaffold } from '../components/PageScaffold'
import WithAuth, { WithAuthProps } from '../components/withAuth'
import ExcuseModal from '../components/ExcuseModal'

interface Props extends WithAuthProps {}

const TutoriumPage: React.FC<Props> = ({ self }) => {
  const excuseModal = useDisclosure()

  return (
    <PageScaffold role={self.role}>
      <ExcuseModal isOpen={true} onClose={excuseModal.onClose} student={{ id: 'ad07c79e-7d96-46dd-9cdf-8fccae1ba75b', absences: [], createdAt: 1, updatedAt: 1, excuses: [], tutorium: null, firstName: '', lastName: '' }} />
    </PageScaffold>
  )
}

export default WithAuth(TutoriumPage)
