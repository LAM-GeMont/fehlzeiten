import { AddIcon, DeleteIcon, RepeatIcon, SearchIcon } from '@chakra-ui/icons'
import { Spinner, Button, IconButton, useDisclosure, useToast, Text, Box, Input, InputGroup, InputLeftElement, Flex, SimpleGrid, Heading} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { FaEdit } from 'react-icons/fa'
import { PageScaffold } from '../../components/PageScaffold'
import SortedTable, { useSortedTable } from '../../components/SortedTable'
import SortedTableStudentsOfTutorium from './SortedTableStudentsOfTutorium'
import WithAuth, { WithAuthProps } from '../../components/withAuth'
import { Role, useStudentsQuery, useTutoriumsQuery } from '../../generated/graphql'
import { toastApolloError } from '../../util'
import { DeleteStudentFromTutoriumModal } from '../../components/DeleteStudentFromTutoriumModal'
import { EditStudentModal } from '../../components/EditStudentModal'
import {StudentType} from "../../../../server/src/entity/Student";

interface Props extends WithAuthProps { }

const Student: React.FC<Props> = ({ self }) => {
    const studentEditModal = useDisclosure()
    const deleteStudentFromTutoriumModal = useDisclosure()
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

    
    let studentData: StudentType[] = []
    allStudentsData.forEach(student => {
        if (student.tutorium.id == id){
            studentData.push(student)
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

    var tutorName = "" 
    var tutoriumName = ""
    allTutoriumsData.forEach(tutorium =>{
        if(tutorium.id == id){
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
        },
        /* {
          Header: '',
          accessor: 'excused'
        }, */
    ], [editStudent, deleteStudentFromTutorium, self.role])


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
          <EditStudentModal isOpen={studentEditModal.isOpen} onClose={studentEditModal.onClose} studentId={rowId} firstName={rowFirstName} lastName={rowLastName} tutoriumId={rowtutoriumId} />
          <DeleteStudentFromTutoriumModal isOpen={deleteStudentFromTutoriumModal.isOpen} onClose={deleteStudentFromTutoriumModal.onClose} rowId={rowId} firstName={rowFirstName} lastName={rowLastName} tutoriumName={tutoriumName} />
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