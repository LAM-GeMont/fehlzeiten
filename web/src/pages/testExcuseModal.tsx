import { useDisclosure } from "@chakra-ui/react";
import React from "react";
import { PageScaffold } from "../components/PageScaffold"
import WithAuth, { WithAuthProps } from "../components/withAuth";
import ExcuseModal from "../components/ExcuseModal";

interface Props extends WithAuthProps {}

const TutoriumPage: React.FC<Props> = ({ self }) => {
  const excuseModal = useDisclosure()

  return (
    <PageScaffold role={self.role}>
      <ExcuseModal isOpen={true} onClose={excuseModal.onClose} />
    </PageScaffold>
  )
}

export default WithAuth(TutoriumPage)
