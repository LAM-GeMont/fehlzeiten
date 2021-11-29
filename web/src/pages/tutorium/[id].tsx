import { AddIcon, DeleteIcon, RepeatIcon, SearchIcon } from '@chakra-ui/icons'
import { Spinner, Button, IconButton, useDisclosure, useToast, Text, Box, Input, InputGroup, InputLeftElement, Flex, SimpleGrid} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { FaEdit } from 'react-icons/fa'
import { PageScaffold } from '../../components/PageScaffold'
import SortedTable, { useSortedTable } from '../../components/SortedTable'
import WithAuth, { WithAuthProps } from '../../components/withAuth'
import { Role, useStudentsQuery } from '../../generated/graphql'
import { toastApolloError } from '../../util'
import { DeleteStudentAlertDialog } from '../../components/DeleteStudentAlertDialog' 
import { CreateStudentModal } from '../../components/CreateStudentModal'

interface Props extends WithAuthProps { }

const Student: React.FC<Props> = ({ self }) => {
    const studentCreateModal = useDisclosure()
    const studentDeleteAlertDialog = useDisclosure()
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

    var allStudentsData = useMemo(() => {
        if (studentsQuery.data?.students != null) {
            return studentsQuery.data.students
        } else {
            return []
        }
    }, [studentsQuery.data])

    
    var studentData
    allStudentsData.forEach(student => {
        if (student.id != id){
            studentData.add(student)
        }
    })

    const openCreate = studentCreateModal.onOpen
    const createStudent = React.useCallback((row) => {
        setRowId(row.original.id)
        setRowFirstName(row.original.firstName)
        setRowLastName(row.original.lastName)
        row.original.tutorium ? setRowTutoriumId(row.original.tutorium.id) : setRowTutoriumId('')
        openCreate()
      }, [openCreate])
    
      const openDelete = studentDeleteAlertDialog.onOpen
      const deleteStudent = React.useCallback((row) => {
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
                  <IconButton isDisabled={self.role === 'TEACHER'} variant="outline" aria-label="Hinzufügen" icon={<FaEdit />} onClick={ () => createStudent(row)} />
                  <Box mr={2}></Box>
                  <IconButton isDisabled={self.role === 'TEACHER'} variant="outline" aria-label="Löschen" icon={<DeleteIcon />} onClick={ () => deleteStudent(row)} />
                </Flex>
              )
        },
        /* {
          Header: '',
          accessor: 'excused'
        }, */
    ], [createStudent, deleteStudent, self.role])


    const data = useMemo(() => {
        if (studentsQuery.data?.students != null) {
          return studentsQuery.data.students
        } else {
          return []
        }
      }, [studentsQuery.data])

    const sortedTable = useSortedTable({
        columns,
        data
      })


    return (
        <PageScaffold role={self.role}>
          <SimpleGrid>
            <Flex direction="column" alignItems="center" minW="300px" minH="600px" margin={5}>
              <Flex w="full" padding={5}>
                <InputGroup flexShrink={10}>
                  <InputLeftElement>
                    <SearchIcon />
                  </InputLeftElement>
                  <Input width="xs" value={sortedTable.filter} onChange={e => sortedTable.setFilter(e.target.value)} />
                </InputGroup>
                
                <IconButton ml={4} variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon />} onClick={() => { studentsQuery.refetch() }}></IconButton>
              </Flex>
              {(data.length === 0) && (
                <Box mt={5}>
                  {(self.role === 'COORDINATOR' && (
                    <Text>Es wurden noch keine Tutorien erstellt.</Text>
                  ))}
                  {(self.role === 'TEACHER' && (
                    <Text>Ihnen sind noch keine Tutorien zugewiesen.</Text>
                  ))}
                </Box>
              )}
            </Flex>
          </SimpleGrid>
          <CreateStudentModal isOpen={studentCreateModal.isOpen} onClose={studentCreateModal.onClose} />
          <DeleteStudentAlertDialog isOpen={studentDeleteAlertDialog.isOpen} onClose={studentDeleteAlertDialog.onClose} rowId={rowId} firstName={rowFirstName} lastName={rowLastName} />
        </PageScaffold>
      )

    /*
    return (
        <PageScaffold role={self.role}>

            <SimpleGrid>
                <Text fontSize="30" fontWeight="bold">{firstName + ' ' + lastName}</Text>
                <Text fontSize="26">{tutorium}</Text>
                <Flex direction="column" alignItems="center" minW="300px" minH="600px" margin={5}>
                    {checkIfAbsencesDataIsEmpty()}
                    {studentAbsences.loading && (<Spinner />)}
                    {studentAbsences.error != null && (<Heading>Error!</Heading>)}
                    {studentAbsences.data != null && (
                        getAbsencesDates().map(function (each) {
                            const year = each.substring(0, 4)
                            const month = each.substring(5, 7)
                            const day = each.substring(8, 10)
                            console.log(each)
                            return (
                                <Box key={each} w="full" border="1px" borderColor="gray.300" borderRadius="md" boxShadow="lg" p="6" rounded="md" bg="white" mb={4}>
                                    <Text fontSize="22" pl={2}>{day}.{month}.{year}</Text>
                                    <SortedTable columns={columns} data={getAbsenceForDate(each)} />
                                </Box>)
                        })
                    )}
                </Flex>
            </SimpleGrid>
            <DeleteAbsenceAlertDialog isOpen={absenceDeleteAlertDialog.isOpen} onClose={absenceDeleteAlertDialog.onClose} rowId={rowId} />
        </PageScaffold>
    )*/
}

export default WithAuth(Student, { roles: [Role.Coordinator] })