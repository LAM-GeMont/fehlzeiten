import { AddIcon, DeleteIcon, RepeatIcon } from '@chakra-ui/icons'
import { Spinner, Button, IconButton, useDisclosure, useToast, Text, Box, Flex, SimpleGrid, Heading } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { FaEdit } from 'react-icons/fa'
import { PageScaffold } from '../../components/PageScaffold'
import SortedTableStudentsOfTutorium from './SortedTableStudentsOfTutorium'
import WithAuth, { WithAuthProps } from '../../components/withAuth'
import { Role, useStudentsQuery, useTutoriumsQuery } from '../../generated/graphql'
import { toastApolloError } from '../../util'
import { DeleteStudentFromTutoriumModal } from '../../components/DeleteStudentFromTutoriumModal'
import { EditStudentModal } from '../../components/EditStudentModal'
import { AddStudentToTutoriumModal } from '../../components/AddStudentToTutoriumModal'
import { Student } from '../../../../server/src/entity/Student'
import {addStudentToTutorium} from "../../../../server/src/resolvers/tutorium/addStudentToTutorium";

interface Props extends WithAuthProps { }

const StudentsOfTutoriumPage: React.FC<Props> = ({ self }) => {
  const studentEditModal = useDisclosure()
  const deleteStudentFromTutoriumModal = useDisclosure()
  const addStudentToTutoriumModal = useDisclosure()
  const toast = useToast()

  const [rowId, setRowId] = React.useState('')
  const [rowFirstName, setRowFirstName] = React.useState('')
  const [rowLastName, setRowLastName] = React.useState('')
  const [rowtutoriumId, setRowTutoriumId] = React.useState('')

  const router = useRouter()
  const { id } = router.query

  const studentsQuery = useStudentsQuery({
    onError: errors => toastApolloError(toast, errors)
  })

  const allStudentsData = useMemo(() => {
    if (studentsQuery.data?.students != null) {
      return studentsQuery.data.students
    } else {
      return []
    }
  }, [studentsQuery.data])

  const studentData: Student[] = []
  allStudentsData.forEach(student => {
    if (student.tutorium != null) {
      if (student.tutorium.id === id) {
        studentData.push(student)
      }
    }
  })

  const tutoriumsQuery = useTutoriumsQuery({
    onError: errors => toastApolloError(toast, errors)
  })

  const allTutoriumsData = useMemo(() => {
    if (tutoriumsQuery.data?.tutoriums != null) {
      return tutoriumsQuery.data.tutoriums
    } else {
      return []
    }
  }, [tutoriumsQuery.data])

  let tutorName = ''
  let tutoriumName = ''
  allTutoriumsData.forEach(tutorium => {
    if (tutorium.id === id) {
      tutorName = tutorium.tutor.name
      tutoriumName = tutorium.name
    }
  })

  const openEdit = studentEditModal.onOpen
  const editStudent = React.useCallback((row) => {
    setRowId(row.original.id)
    setRowFirstName(row.original.firstName)
    setRowLastName(row.original.lastName)
    row.original.tutorium ? setRowTutoriumId(row.original.tutorium.id) : setRowTutoriumId('')
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

  return (
        <PageScaffold role={self.role}>
          <SimpleGrid>
            <Flex direction="column" alignItems="center" minW="300px" minH="600px" margin={5}>
              <Flex w="full" padding={5}>
                <Button marginLeft="auto" leftIcon={<AddIcon />} onClick={addStudentToTutoriumModal.onOpen}>Schüler zu Tutorium hinzufügen</Button>
                <IconButton ml={4} variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon />} onClick={() => { studentsQuery.refetch() }}></IconButton>
              </Flex>
              {studentsQuery.loading && (<Spinner />)}
                    {studentsQuery.error != null && (<Heading>Error!</Heading>)}
                    {studentsQuery.data != null && (
                      <Box w="full" border="1px" borderColor="gray.300" borderRadius="md" boxShadow="lg" p="6" rounded="md" bg="white" mb={4}>
                        <Text fontSize="22" pl={2}>Tutorium: {tutoriumName} | Tutor: {tutorName}</Text>
                        <SortedTableStudentsOfTutorium columns={columns} data={studentData} />
                      </Box>
                    )}
            </Flex>
          </SimpleGrid>
          <AddStudentToTutoriumModal isOpen={addStudentToTutoriumModal.isOpen} onClose={addStudentToTutoriumModal.onClose} studentId={rowId} firstName={rowFirstName} lastName={rowLastName} tutoriumId={rowtutoriumId} />
          <EditStudentModal isOpen={studentEditModal.isOpen} onClose={studentEditModal.onClose} studentId={rowId} firstName={rowFirstName} lastName={rowLastName} tutoriumId={rowtutoriumId} />
          <DeleteStudentFromTutoriumModal isOpen={deleteStudentFromTutoriumModal.isOpen} onClose={deleteStudentFromTutoriumModal.onClose} rowId={rowId} firstName={rowFirstName} lastName={rowLastName} tutoriumName={tutoriumName} />
        </PageScaffold>
  )
}

export default WithAuth(StudentsOfTutoriumPage, { roles: [Role.Coordinator] })
