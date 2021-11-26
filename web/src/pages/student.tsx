import { useDisclosure } from '@chakra-ui/hooks'
import { AddIcon, DeleteIcon, RepeatIcon } from '@chakra-ui/icons'
import { Box, Text, Spinner, Button, Flex, IconButton, SimpleGrid, useToast, Heading, Link } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { FaEdit } from 'react-icons/fa'
import { CreateStudentModal } from '../components/CreateStudentModal'
import { DeleteStudentAlertDialog } from '../components/DeleteStudentAlertDialog'
import { EditStudentModal } from '../components/EditStudentModal'
import { PageScaffold } from '../components/PageScaffold'
import SortedTable from '../components/SortedTable'
import WithAuth, { WithAuthProps } from '../components/withAuth'
import { Role, useStudentsQuery } from '../generated/graphql'
import { toastApolloError } from '../util'

interface Props extends WithAuthProps {}

const StudentPage: React.FC<Props> = ({ self }) => {
  const studentCreateModal = useDisclosure()
  const studentEditModal = useDisclosure()
  const studentDeleteAlertDialog = useDisclosure()
  const toast = useToast()
  const [rowId, setRowId] = React.useState('')
  const [rowFirstName, setRowFirstName] = React.useState('')
  const [rowLastName, setRowLastName] = React.useState('')
  const [rowtutoriumId, setRowTutoriumId] = React.useState('')

  const studentsQuery = useStudentsQuery({
    onError: errors => toastApolloError(toast, errors)
  })

  const data = useMemo(() => {
    if (studentsQuery.data?.students != null) {
      return studentsQuery.data.students
    } else {
      return []
    }
  }, [studentsQuery.data])

  const columns = useMemo(() => [
    {
      Header: 'Vorname',
      accessor: 'firstName',
      Cell: ({ row }) => (
        <Link href={`/student/${row.original.id}`}>
          <Text>{`${row.original.firstName}`}</Text>
        </Link>
      )
    },
    {
      Header: 'Nachname',
      accessor: 'lastName'
    },
    {
      Header: 'Tutorium',
      accessor: 'tutorium.name'
    },
    {
      Header: 'Aktionen',
      Cell: ({ row }) => (
                <Flex justifyContent="center">
                    <IconButton isDisabled={self.role === 'TEACHER'} variant="outline" aria-label="Bearbeiten" icon={<FaEdit />} onClick={ () => {
                      setRowId(row.original.id)
                      setRowFirstName(row.original.firstName)
                      setRowLastName(row.original.lastName)
                      row.original.tutorium ? setRowTutoriumId(row.original.tutorium.id) : setRowTutoriumId('')
                      studentEditModal.onOpen()
                    }} />
                    <Box mr={2}></Box>
                    <IconButton isDisabled={self.role === 'TEACHER'} variant="outline" aria-label="Löschen" icon={<DeleteIcon />} onClick={ () => {
                      setRowId(row.original.id)
                      setRowFirstName(row.original.firstName)
                      setRowLastName(row.original.lastName)
                      studentDeleteAlertDialog.onOpen()
                    }} />
                </Flex>
      )
    }
  ], [studentEditModal, studentDeleteAlertDialog, self.role])

  return (
        <PageScaffold role={self.role}>
            <SimpleGrid>
                <Flex direction="column" alignItems="center" minW="300px" minH="600px" margin={5}>
                    <Flex w="full" padding={5}>
                        <Button marginLeft="auto" leftIcon={<AddIcon />} onClick={studentCreateModal.onOpen}>Schüler hinzufügen</Button>
                        <IconButton ml={4} variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon />} onClick={() => { studentsQuery.refetch() } }></IconButton>
                    </Flex>
                    {studentsQuery.loading && (<Spinner />)}
                    {studentsQuery.error != null && (<Heading>Error!</Heading>)}
                    {studentsQuery.data != null && (
                        <SortedTable columns={columns} data={data} />
                    )}
                </Flex>
            </SimpleGrid>
            <CreateStudentModal isOpen={studentCreateModal.isOpen} onClose={studentCreateModal.onClose} />
            <EditStudentModal isOpen={studentEditModal.isOpen} onClose={studentEditModal.onClose} studentId={rowId} firstName={rowFirstName} lastName={rowLastName} tutoriumId={rowtutoriumId} />
            <DeleteStudentAlertDialog isOpen={studentDeleteAlertDialog.isOpen} onClose={studentDeleteAlertDialog.onClose} rowId={rowId} firstName={rowFirstName} lastName={rowLastName} />
        </PageScaffold>
  )
}

export default WithAuth(StudentPage, { roles: [Role.Coordinator] })
