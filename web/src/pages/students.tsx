import { Flex, Heading, SimpleGrid } from "@chakra-ui/layout";
import { Spinner, Button, IconButton, useDisclosure, useToast } from "@chakra-ui/react";
import React, { useMemo } from "react";
import { PageScaffold } from "../components/PageScaffold"
import { Role, TutoriumDeleteErrorCode, useDeleteTutoriumMutation, useTutoriumsQuery } from "../generated/graphql";
import { AddIcon, DeleteIcon, RepeatIcon } from "@chakra-ui/icons";
import { FaPen } from 'react-icons/fa';
import { CreateStudentModal } from "../components/CreateStudentModal";
import SortedTable from "../components/SortedTable";
import { toastApolloError } from "../util";
import WithAuth, { WithAuthProps } from "../components/withAuth";

interface TableRow {
  name: string,
  id: string,
  tutorium: string,
  createdAt: string
}

interface Props extends WithAuthProps {}

const StudentPage: React.FC<Props> = ({ self }) => {
  const studentCreateModal = useDisclosure()
  const toast = useToast()

  //TODO
  const tutoriumsQuery = useTutoriumsQuery({
    onError: errors => toastApolloError(toast, errors)
  })
  //TODO
  const [ remove, removeMutation ] = useDeleteTutoriumMutation({
    onError: errors => toastApolloError(toast, errors),
    onCompleted: (res) => {
      res.deleteTutorium.errors.forEach(error => {
        toast({
          title: "Fehler beim Löschen",
          description: error.code,
          isClosable: true,
          status: "error"
        })
      })
    }
  })

  //TODO
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
      Header: "Tutorium",
      accessor: "tutorium" as keyof TableRow
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
          <IconButton variant="outline" aria-label="Editieren" icon={<FaPen />} onClick={
            () => {
              remove({
                variables: { deleteTutoriumData: { id: row.values.id }},
                refetchQueries: "all",
              })
            }
          }/>
          <IconButton variant="outline" aria-label="Löschen" icon={<DeleteIcon />} onClick={
            () => {
              remove({
                variables: { deleteTutoriumData: { id: row.values.id }},
                refetchQueries: "all",
              })
            }
          }/>
        </Flex>
      )
    }
  ], [])

  return (
    <PageScaffold role={self.role}>
      <SimpleGrid>
        <Flex direction="column" alignItems="center" minW="300px" minH="600px" margin={5}>
          <Flex w="full" padding={5}>
            <Button marginLeft="auto" leftIcon={<AddIcon />} onClick={studentCreateModal.onOpen}>Schüler hinzufügen</Button>
            <IconButton ml={4} variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon />} onClick={() => { tutoriumsQuery.refetch() }}>Schüler hinzufügen</IconButton>
          </Flex>
          {tutoriumsQuery.loading && (<Spinner />)}
          {tutoriumsQuery.error != null && (<Heading>Error!</Heading>)}
          {tutoriumsQuery.data != null && (
            <SortedTable columns={columns} data={data} />
          )}
        </Flex>
      </SimpleGrid>
      <CreateStudentModal isOpen={studentCreateModal.isOpen} onClose={studentCreateModal.onClose} />
    </PageScaffold>
  )
}

export default WithAuth(StudentPage, { roles: [Role.Coordinator]})