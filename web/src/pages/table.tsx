import { useDisclosure } from '@chakra-ui/hooks'
import { AddIcon, DeleteIcon, RepeatIcon, SearchIcon } from '@chakra-ui/icons'
import { Box, Text, Spinner, Button, Flex, IconButton, SimpleGrid, useToast, Heading, Link, Input, InputGroup, InputLeftElement, chakra, Spacer } from '@chakra-ui/react'
import React, { useCallback, useMemo, useState } from 'react'
import { FaEdit } from 'react-icons/fa'
import { Row, useAsyncDebounce } from 'react-table'
import { CreateStudentModal } from '../components/CreateStudentModal'
import { DeleteStudentAlertDialog } from '../components/DeleteStudentAlertDialog'
import { EditStudentModal } from '../components/EditStudentModal'
import { PageScaffold } from '../components/PageScaffold'
import { CardTable } from '../components/BetterTable'
import WithAuth, { WithAuthProps } from '../components/withAuth'
import { Role, useStudentsQuery } from '../generated/graphql'
import { toastApolloError } from '../util'

interface Props extends WithAuthProps {}

const StudentPage: React.FC<Props> = ({ self }) => {
  const studentCreateModal = useDisclosure()
  const studentEditModal = useDisclosure()
  const studentDeleteAlertDialog = useDisclosure()
  const toast = useToast()
  const [rowId, setRowId] = useState('')
  const [rowFirstName, setRowFirstName] = useState('')
  const [rowLastName, setRowLastName] = useState('')
  const [rowtutoriumId, setRowTutoriumId] = useState('')

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

  const openEdit = studentEditModal.onOpen
  const editStudent = useCallback((row) => {
    setRowId(row.original.id)
    setRowFirstName(row.original.firstName)
    setRowLastName(row.original.lastName)
    row.original.tutorium ? setRowTutoriumId(row.original.tutorium.id) : setRowTutoriumId('')
    openEdit()
  }, [openEdit])

  const openDelete = studentDeleteAlertDialog.onOpen
  const deleteStudent = useCallback((row) => {
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
      Header: 'Tutorium',
      accessor: 'tutorium.name'
    },
    {
      Header: 'Aktionen',
      Cell: ({ row }) => (
                <Flex justifyContent="center">
                    <IconButton isDisabled={self.role === 'TEACHER'} variant="outline" aria-label="Bearbeiten" icon={<FaEdit />} onClick={ () => { editStudent(row) }} />
                    <Box mr={2}></Box>
                    <IconButton isDisabled={self.role === 'TEACHER'} variant="outline" aria-label="Löschen" icon={<DeleteIcon />} onClick={ () => { deleteStudent(row) }} />
                </Flex>
      )
    }
  ], [deleteStudent, editStudent, self.role])

  const setFilter = useAsyncDebounce((filter, set) => set(filter), 200)

  return (
        <PageScaffold role={self.role}>
            <SimpleGrid>
                <Flex direction="column" alignItems="center" minW="300px" minH="600px">
                    {studentsQuery.loading && (<Spinner />)}
                    {studentsQuery.error != null && (<Heading>Error!</Heading>)}
                    {studentsQuery.data != null && (
                      <CardTable data={data} columns={columns}
                        before={ (table) => (
                            <Flex wrap="wrap" justify="flex-end" maxW="full" mb={4}>
                              <InputGroup flexShrink={10} w="full" maxW="full"mb={2}>
                                <InputLeftElement>
                                  <SearchIcon />
                                </InputLeftElement>
                                <Input width="full" value={null} onChange={e => setFilter(e.target.value, table.setGlobalFilter)} />
                              </InputGroup>
                              <Flex flexGrow={2}>
                                <Button mr={2} flexGrow={2} leftIcon={<AddIcon />} onClick={studentCreateModal.onOpen}>Schüler hinzufügen</Button>
                                <IconButton variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon />} onClick={() => { studentsQuery.refetch() }}></IconButton>
                              </Flex>
                            </Flex>
                        )}

                        sortableColumns={['firstName', 'lastName', 'tutorium.name']}

                        keyFn={(row) => row.original.id}

                        rowFn={(row: Row<any>) => (
                          <Flex w="full" transition="all" transitionDuration="200ms" boxShadow="sm" _hover={{ boxShadow: 'md' }} borderRadius="md" alignItems="center" px={4} py={2}>
                            <Link href={`/student/${row.original.id}`}>
                              <Text>{row.cells[0].render('Cell')}{' '}<chakra.span color="black">{row.cells[1].render('Cell')}</chakra.span></Text>
                            </Link>
                            <Spacer />
                            <Text mx={4}>{row.cells[2].render('Cell')}</Text>
                            {row.cells[3].render('Cell')}
                          </Flex>
                        )}
                      />
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