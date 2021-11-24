import { Flex, Heading, SimpleGrid } from "@chakra-ui/layout";
import { Spinner, Button, IconButton, useDisclosure, useToast, Text, Box } from "@chakra-ui/react";
import React, { useMemo } from "react";
import { PageScaffold } from "../components/PageScaffold"
import { Role, useTutoriumsQuery } from "../generated/graphql";
import { AddIcon, DeleteIcon, RepeatIcon } from "@chakra-ui/icons";
import { CreateTutoriumModal } from "../components/CreateTutoriumModal";
import SortedTable from "../components/SortedTable";
import { toastApolloError } from "../util";
import WithAuth, { WithAuthProps } from "../components/withAuth";
import { DeleteTutoriumAlertDialog } from "../components/DeleteTutoriumAlertDialog";

interface TableRow {
  name: string,
  id: string,
  createdAt: string
}

interface Props extends WithAuthProps {}

const TutoriumPage: React.FC<Props> = ({ self }) => {
  const tutoriumCreateModal = useDisclosure()
  const tutoriumDeleteAlertDialog = useDisclosure()
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
      Header: 'Kursname',
      accessor: 'name' as keyof TableRow
    },
    {
      Header: 'Tutorname',
      accessor: 'tutor.name' as keyof TableRow
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
              setRowId(row.original.id)
              setRowName(row.original.name)
              tutoriumDeleteAlertDialog.onOpen()   
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
            <IconButton ml={4} variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon />} onClick={() => { tutoriumsQuery.refetch() }}></IconButton>
          </Flex>
          {tutoriumsQuery.loading && (<Spinner />)}
          {tutoriumsQuery.error != null && (<Heading>Error!</Heading>)}
          {tutoriumsQuery.data != null && (
            <SortedTable columns={columns} data={data} />
          )}
          {(data.length == 0) &&(
            <Box mt={5}>
              {(self.role == "COORDINATOR" && (
                <Text>Es wurden noch keine Tutorien erstellt.</Text>
              ))}
              {(self.role == "TEACHER" && (
                <Text>Ihnen sind noch keine Tutorien zugewiesen.</Text>
              ) )}
            </Box>
            )}
        </Flex>
      </SimpleGrid>
      <CreateTutoriumModal isOpen={tutoriumCreateModal.isOpen} onClose={tutoriumCreateModal.onClose} />
      <DeleteTutoriumAlertDialog isOpen={tutoriumDeleteAlertDialog.isOpen} onClose={tutoriumDeleteAlertDialog.onClose} rowId={rowId} name={rowName} />
    </PageScaffold>
  )
}

export default WithAuth(TutoriumPage, { roles: [Role.Coordinator]})