import { AddIcon, ArrowBackIcon, DeleteIcon, RepeatIcon } from '@chakra-ui/icons'
import { Link, Select, Box, Button, Flex, Heading, IconButton, SimpleGrid, Spinner, Text, useDisclosure, useToast, Center, AlertIcon } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import React, { useMemo } from 'react'
import { PageScaffold } from '../../components/PageScaffold'
import SortedTable from './SortedTableAbsences'
import WithAuth, { WithAuthProps } from '../../components/withAuth'
import { Role, useAbsencesForStudentQuery, useSemestersQuery } from '../../generated/graphql'
import { toastApolloError } from '../../util'
import { DeleteAbsenceAlertDialog } from '../../components/DeleteAbsenceAlertDialog'
import ErrorPage from 'next/error'
import ExcuseModal from '../../components/ExcuseModal'

interface Props extends WithAuthProps { }

const Student: React.FC<Props> = ({ self }) => {
  const absenceDeleteAlertDialog = useDisclosure()
  const excuseModal = useDisclosure()
  const router = useRouter()
  const { id } = router.query

  const [rowId, setRowId] = React.useState('')
  const [selectedSemester, setSelectedSemester] = React.useState([])
  const handleChange = (event) => {
    const semesterDates = event.target.value.split(',')
    setSelectedSemester(semesterDates)
  }

  const toast = useToast()
  console.log(id)

  const studentQuery = useAbsencesForStudentQuery({
    variables: {
      studentId: id.toString()
    },
    onError: errors => toastApolloError(toast, errors)
  })

  const semestersQuery = useSemestersQuery({
    onError: errors => toastApolloError(toast, errors)
  })

  const absences = studentQuery.data?.student?.absences || []
  const student = studentQuery.data?.student
  const semesters = semestersQuery.data?.semesters || []

  console.log(semesters)

  const columns = useMemo(() => [
    {
      Header: 'Stunden',
      accessor: 'lessonIndex'
    },
    {
      Header: 'eingereicht von',
      accessor: 'submittedBy.name'
    },
    {
      Header: '',
      accessor: 'exam'
    },
    /* {
      Header: '',
      accessor: 'excused'
    }, */
    {
      Header: 'Aktionen',
      Cell: ({ row }) => (
        <Flex justifyContent="center">
          <IconButton isDisabled={self.role !== Role.Coordinator && row.original.submittedBy !== self.id && student.tutorium?.tutor?.id !== self.id} variant="outline" aria-label="Löschen" icon={<DeleteIcon />} onClick={() => {
            setRowId(row.original.id)
            absenceDeleteAlertDialog.onOpen()
          }} />
        </Flex>
      )
    }
  ], [absenceDeleteAlertDialog, self.id, self.role, student])

  const dates = Array.from(new Set(absences.map(absence => absence.date))).sort().reverse()

  if (studentQuery.loading) {
    return <Center h="100vh"><Spinner /></Center>
  }

  if (studentQuery.error != null) {
    return (
      <PageScaffold role={self.role}>
        <Center h="100vh" color="red">
          <AlertIcon />
          <Heading>Fehler beim Laden der Daten</Heading>
        </Center>
      </PageScaffold>
    )
  }

  if (student == null) {
    <ErrorPage statusCode={404} />
  }

  function inSemesterRange (value) {
    const date = new Date(value)
    const semesterStartDate = new Date(selectedSemester[0])
    const semesterEndDate = new Date(selectedSemester[1])
    if ((date >= semesterStartDate) && (date <= semesterEndDate)) {
      console.log(date)
      console.log(semesterStartDate)
      console.log(semesterEndDate)
      return date
    }
  }

  return (
    <PageScaffold role={self.role}>
      <SimpleGrid>
        <NextLink href='/student'>
          <Link >
            <Flex alignItems="center">
              <ArrowBackIcon/>
              <Text>Zurück zur Übersicht</Text>
            </Flex>
          </Link>
        </NextLink>
        <Text fontSize="30" fontWeight="bold">{student.firstName + ' ' + student.lastName}</Text>
        <Text fontSize="26">{student.tutorium?.name}</Text>
        <Flex direction="column" alignItems="center" minW="300px" minH="600px" margin={5}>
          {dates.length < 1 &&
            <Flex w="full" padding={5}>
              <Text fontSize="24" fontWeight="bold">Es wurden noch keine Fehlzeiten erfasst...</Text>
            </Flex>
          }
          {dates.length >= 1 && (
            <>
              <Flex w="full" pt={5} pb={5}>
                <Text pr={4} fontSize="24" fontWeight="bold">Fehlzeiten</Text>
                <Button ml="auto" leftIcon={<AddIcon />} onClick={() => { excuseModal.onOpen() }}>Entschuldigung hinzufügen</Button>
                <IconButton ml={4} variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon />} onClick={() => { studentQuery.refetch() }}></IconButton>
              </Flex>
              <Select variant='outline' placeholder='Semester auswählen' value={selectedSemester} onChange={handleChange}>
                {semesters.map(semester => {
                  return (
                    <option value={[semester.startDate, semester.endDate]} key={semester.id}>{semester.name}</option>
                  )
                })}
              </Select>
              {console.log(selectedSemester)}
              {dates.filter(inSemesterRange).map(date => {
                return (
                  <Box mt={5} key={date} w="full" border="1px" borderColor="gray.300" borderRadius="md" boxShadow="lg" p="6" rounded="md" bg="white" mb={4}>
                    <Text fontSize="22" pl={2}>{new Date(date).toLocaleDateString()}</Text>
                    <SortedTable columns={columns} data={absences.filter(absence => absence.date === date)} />
                  </Box>)
              })}
            </>
          )}
        </Flex>
      </SimpleGrid>
      <DeleteAbsenceAlertDialog isOpen={absenceDeleteAlertDialog.isOpen} onClose={absenceDeleteAlertDialog.onClose} rowId={rowId} />
      <ExcuseModal isOpen={excuseModal.isOpen} onClose={excuseModal.onClose} studentId={student.id}/>
    </PageScaffold>
  )
}

export default WithAuth(Student, { roles: [Role.Coordinator] })
