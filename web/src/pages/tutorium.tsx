import { Flex, Heading, SimpleGrid } from "@chakra-ui/layout";
import { Spinner, Button, IconButton, useDisclosure, useToast } from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import { PageScaffold } from "../components/PageScaffold"
import { Role, TutoriumDeleteErrorCode, useDeleteTutoriumMutation, useTutoriumsQuery } from "../generated/graphql";
import { AddIcon, DeleteIcon, RepeatIcon } from "@chakra-ui/icons";
import { CreateTutoriumModal } from "../components/CreateTutoriumModal";
import { DeleteTutoriumModal } from "../components/DeleteTutoriumModal";
import SortedTable from "../components/SortedTable";
import { toastApolloError } from "../util";
import WithAuth, { WithAuthProps } from "../components/withAuth";

interface TableRow {
  name: string,
  id: string,
  createdAt: string
}

interface Props extends WithAuthProps {}

const TutoriumPage: React.FC<Props> = ({ self }) => {
  const tutoriumCreateModal = useDisclosure()
  const tutoriumDeleteModal = useDisclosure()
  const toast = useToast()
  const [rowId, setRowId] = React.useState("")
  const [rowName, setRowName] = React.useState("")

  const tutoriumsQuery = useTutoriumsQuery({
    onError: errors => toastApolloError(toast, errors)
  })

  const data = useMemo(() => {
    if (tutoriumsQuery.data?.tutoriums != null) {
      return tutoriumsQuery.data.tutoriums
    } else {
      return []
    }
  }, [tutoriumsQuery.data])

  const columns = useMemo(() => [
    {
      Header: 'Name',
      accessor: 'name' as keyof TableRow
    },
    {
      Header: "ID",
      accessor: "id" as keyof TableRow
    },
    {
      Header: "Erstellt am",
      accessor: "createdAt" as keyof TableRow,
      Cell: ({value}) => new Date(value).toLocaleDateString()
    },
    {
      Header: "Aktionen",
      Cell: ({row}) => (
        <Flex justifyContent="center">
          <IconButton variant="outline" aria-label="Löschen" icon={<DeleteIcon />} onClick={ () => {
              setRowId(row.values.id)
              setRowName(row.values.name)
              tutoriumDeleteModal.onOpen()   
          }} />
        </Flex>
      )
    }
  ], [])

  return (
    <PageScaffold role={self.role}>
      <SimpleGrid>
        <Flex direction="column" alignItems="center" minW="300px" minH="600px" margin={5}>
          <Flex w="full" padding={5}>
            <Button marginLeft="auto" leftIcon={<AddIcon />} onClick={tutoriumCreateModal.onOpen}>Tutorium hinzufügen</Button>
            <IconButton ml={4} variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon />} onClick={() => { tutoriumsQuery.refetch() }}>Tutorium hinzufügen</IconButton>
          </Flex>
          {tutoriumsQuery.loading && (<Spinner />)}
          {tutoriumsQuery.error != null && (<Heading>Error!</Heading>)}
          {tutoriumsQuery.data != null && (
            <SortedTable columns={columns} data={data} />
          )}
        </Flex>
      </SimpleGrid>
      <CreateTutoriumModal isOpen={tutoriumCreateModal.isOpen} onClose={tutoriumCreateModal.onClose} />
      <DeleteTutoriumModal isOpen={tutoriumDeleteModal.isOpen} onClose={tutoriumDeleteModal.onClose} rowId={rowId} rowName={rowName} />
    </PageScaffold>
  )
}

export default WithAuth(TutoriumPage, { roles: [Role.Coordinator]})