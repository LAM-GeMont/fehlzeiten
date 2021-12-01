import { AddIcon, DeleteIcon, RepeatIcon } from '@chakra-ui/icons'
import { Spinner, Button, IconButton, useDisclosure, useToast, Text, Box, Flex, SimpleGrid, Heading, Center, AlertIcon } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import React, { useMemo } from 'react'
import { FaEdit } from 'react-icons/fa'
import { PageScaffold } from '../../components/PageScaffold'
import SortedTable, { useSortedTable } from '../../components/SortedTable'
import WithAuth, { WithAuthProps } from '../../components/withAuth'
import { Role, useTutoriumQuery } from '../../generated/graphql'
import { toastApolloError } from '../../util'
import { DeleteStudentFromTutoriumModal } from '../../components/DeleteStudentFromTutoriumModal'
import { EditStudentModal } from '../../components/EditStudentModal'
import { AddStudentToTutoriumModal } from '../../components/AddStudentToTutoriumModal'

interface Props extends WithAuthProps { }

const StudentsOfTutoriumPage: React.FC<Props> = ({ self }) => {
  const studentEditModal = useDisclosure()
  const deleteStudentFromTutoriumModal = useDisclosure()
  const addStudentToTutoriumModal = useDisclosure()
  const toast = useToast()

  const [rowId, setRowId] = React.useState('')
  const [rowFirstName, setRowFirstName] = React.useState('')
  const [rowLastName, setRowLastName] = React.useState('')

  const router = useRouter()
  const { id } = router.query
  const tutoriumQuery = useTutoriumQuery({
    variables: { tutoriumId: id.toString() },
    onError: errors => toastApolloError(toast, errors)
  })
  const tutorium = tutoriumQuery.data?.tutorium
  const students = tutoriumQuery.data?.tutorium.students

  const openEdit = studentEditModal.onOpen
  const editStudent = React.useCallback((row) => {
    setRowId(row.original.id)
    setRowFirstName(row.original.firstName)
    setRowLastName(row.original.lastName)
    openEdit()
  }, [openEdit])

  const openDelete = deleteStudentFromTutoriumModal.onOpen
  const deleteStudentFromTutorium = React.useCallback((row) => {
    setRowId(row.original.id)
    setRowFirstName(row.original.firstName)
    setRowLastName(row.original.lastName)
    openDelete()
  }, [openDelete])

  const columns = useMemo(() => [
    {
      Header: 'Vorname',
      accessor: 'firstName'
    },
    {
      Header: 'Nachname',
      accessor: 'lastName'
    },
    {
      Header: 'Aktionen',
      accessor: 'exam',
      Cell: ({ row }) => (
                <Flex justifyContent="center">
                  <IconButton isDisabled={self.role === 'TEACHER'} variant="outline" aria-label="Bearbeiten" icon={<FaEdit />} onClick={ () => editStudent(row)} />
                  <Box mr={2}></Box>
                  <IconButton isDisabled={self.role === 'TEACHER'} variant="outline" aria-label="Löschen" icon={<DeleteIcon />} onClick={ () => deleteStudentFromTutorium(row)} />
                </Flex>
      )
    }
  ], [editStudent, deleteStudentFromTutorium, self.role])

  const data = useMemo(() => {
    if (students != null) {
      return students
    } else {
      return []
    }
  }, [students])

  const sortedTable = useSortedTable({
    columns,
    data
  })

  if (tutoriumQuery.loading) {
    return <Center h="100vh"><Spinner /></Center>
  }

  if (tutoriumQuery.error != null) {
    return (
        <PageScaffold role={self.role}>
          <Center h="100vh" color="red">
            <AlertIcon />
            <Heading>Fehler beim Laden der Daten</Heading>
          </Center>
        </PageScaffold>
    )
  }

  if (tutorium == null) {
    <ErrorPage statusCode={404} />
  }

  return (
        <PageScaffold role={self.role}>
          <SimpleGrid>
            <Flex direction="column" alignItems="center" minW="300px" minH="600px" margin={5}>
              <Flex w="full" padding={5}>
                <Button marginLeft="auto" leftIcon={<AddIcon />} onClick={addStudentToTutoriumModal.onOpen}>Schüler zu Tutorium hinzufügen</Button>
                <IconButton ml={4} variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon />} onClick={() => { tutoriumQuery.refetch() }}></IconButton>
              </Flex>
              {tutoriumQuery.loading && (<Spinner />)}
                    {tutoriumQuery.error != null && (<Heading>Error!</Heading>)}
                    {tutoriumQuery.data != null && (
                      <Box w="full" border="1px" borderColor="gray.300" borderRadius="md" boxShadow="lg" p="6" rounded="md" bg="white" mb={4}>
                        <Text fontSize="22" pl={2}>Tutorium: {tutorium.name} | Tutor: {tutorium.tutor.name}</Text>
                        <SortedTable {...sortedTable.tableProps}/>
                      </Box>
                    )}
            </Flex>
          </SimpleGrid>
          <AddStudentToTutoriumModal isOpen={addStudentToTutoriumModal.isOpen} onClose={addStudentToTutoriumModal.onClose} studentId={rowId} firstName={rowFirstName} lastName={rowLastName} tutoriumId={tutorium.id} />
          <EditStudentModal isOpen={studentEditModal.isOpen} onClose={studentEditModal.onClose} studentId={rowId} firstName={rowFirstName} lastName={rowLastName} tutoriumId={tutorium.id} />
          <DeleteStudentFromTutoriumModal isOpen={deleteStudentFromTutoriumModal.isOpen} onClose={deleteStudentFromTutoriumModal.onClose} rowId={rowId} firstName={rowFirstName} lastName={rowLastName} tutoriumName={tutorium.name} />
        </PageScaffold>
  )
}

export default WithAuth(StudentsOfTutoriumPage, { roles: [Role.Coordinator] })
