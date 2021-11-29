import { AddIcon, DeleteIcon, RepeatIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, Heading, IconButton, SimpleGrid, Spinner, Text, useDisclosure, useToast } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { PageScaffold } from '../../components/PageScaffold'
import SortedTable from './SortedTableAbsences'
import WithAuth, { WithAuthProps } from '../../components/withAuth'
import { Role, useAbsencesForStudentQuery, useStudentsQuery } from '../../generated/graphql'
import { toastApolloError } from '../../util'
import { DeleteAbsenceAlertDialog } from '../../components/DeleteAbsenceAlertDialog'

interface Props extends WithAuthProps { }

const Student: React.FC<Props> = ({ self }) => {
  const absenceDeleteAlertDialog = useDisclosure()
  const router = useRouter()
  const { id } = router.query

  const [rowId, setRowId] = React.useState('')

  const toast = useToast()

  const studentsQuery = useStudentsQuery({
    onError: errors => toastApolloError(toast, errors)
  })

  const studentAbsences = useAbsencesForStudentQuery({
    variables: {
      studentId: id.toString()
    }
  })

  const studentsData = useMemo(() => {
    if (studentsQuery.data?.students != null) {
      return studentsQuery.data.students
    } else {
      return []
    }
  }, [studentsQuery.data])

  const absenceData = useMemo(() => {
    if (studentAbsences.data?.absencesForStudent.absences != null) {
      return studentAbsences.data.absencesForStudent.absences
    } else {
      return []
    }
  }, [studentAbsences.data])

  let firstName = ''
  let lastName = ''
  let tutorium = ''
  let tutorId = ''

  function getStudent () {
    studentsData.forEach(e => {
      if (e.id === id) {
        firstName = (e.firstName)
        lastName = (e.lastName)
        if (e.tutorium !== null) {
          tutorium = (e.tutorium.name)
          if (e.tutorium.tutor !== null) {
            tutorId = (e.tutorium.tutor.id)
          }
        }
      }
    })
  }

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
    {
      Header: 'Aktionen',
      Cell: ({ row }) => (
        <Flex justifyContent="center">
          <IconButton isDisabled={self.role !== Role.Coordinator && row.original.submittedBy !== self.id && tutorId !== self.id} variant="outline" aria-label="Löschen" icon={<DeleteIcon />} onClick={() => {
            setRowId(row.original.id)
            absenceDeleteAlertDialog.onOpen()
          }} />
        </Flex>
      )
    }
  ], [absenceDeleteAlertDialog, self.id, self.role, tutorId])

  const dates = []

  function getAbsencesDates() {
    absenceData.forEach(e => {
      dates.push(e.date)
    })

    const unique = [...Array.from(new Set(dates))]
    unique.sort()
    unique.reverse()

    return unique
  }

  function getAbsenceForDate(date: string) {
    return absenceData.filter(absenceData => absenceData.date === date)
  }

  function checkIfAbsencesDataIsEmpty() {
    if (absenceData.length > 0) {
      return (
        <Flex w="full" padding={5}>
          <Text fontSize="24" fontWeight="bold">Fehlzeiten</Text>
          <Button marginLeft="auto" leftIcon={<AddIcon />} /* onClick={TODO} */>Entschuldigung hinzufügen</Button>
          <IconButton ml={4} variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon />} onClick={() => { studentAbsences.refetch() }}></IconButton>
        </Flex>
      )
    } else {
      return (
        <Flex w="full" padding={5}>
          <Text fontSize="24" fontWeight="bold">Es wurden noch keine Fehlzeiten erfasst...</Text>
        </Flex>
      )
    }
  }

  return (
    <PageScaffold role={self.role}>
      {console.log(getAbsencesDates())}
      {getStudent()}

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
                <Box key={each} w="full" border="1px" borderColor="gray.300" borderRadius="md" boxShadow="2xl" p="6" rounded="md" bg="white" mb={4}>
                  <Text fontSize="22" pl={2}>{day}.{month}.{year}</Text>
                  <SortedTable columns={columns} data={getAbsenceForDate(each)} />
                </Box>)
            })
          )}
        </Flex>
      </SimpleGrid>
      <DeleteAbsenceAlertDialog isOpen={absenceDeleteAlertDialog.isOpen} onClose={absenceDeleteAlertDialog.onClose} rowId={rowId} />
    </PageScaffold>
  )
}

export default WithAuth(Student, { roles: [Role.Coordinator] })
