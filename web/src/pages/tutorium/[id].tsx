import { AddIcon, DeleteIcon, RepeatIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, Heading, IconButton, SimpleGrid, Spinner, Text, useToast } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { PageScaffold } from '../../components/PageScaffold'
import SortedTable from './SortedTableAbsences'
import WithAuth, { WithAuthProps } from '../../components/withAuth'
import { Role, useStudentsForTutoriumQuery } from '../../generated/graphql'
import { toastApolloError } from '../../util'
import { ApolloError } from '@apollo/client'

interface Props extends WithAuthProps { }

const Tutorium: React.FC<Props> = ({ self }) => {
  const router = useRouter()
  const { id } = router.query

  // const absenceDeleteAlertDialog = useDisclosure()

  // const [rowId, setRowId] = useState('')

  const toast = useToast()

  const studentsForTutoriumQuery = useStudentsForTutoriumQuery({
    variables: {
      tutoriumId: id.toString()
    },
    onError: (errors: ApolloError) => toastApolloError(toast, errors)
  })

  const studentsForTutoriumData = useMemo(() => {
    if (studentsForTutoriumQuery.data?.studentsForTutorium.students != null) {
      console.log(studentsForTutoriumQuery.data.studentsForTutorium.students)
      return studentsForTutoriumQuery.data.studentsForTutorium.students
    } else {
      return []
    }
  }, [studentsForTutoriumQuery.data])

  const absences = []

  let tutorId = ''

  function getAbsences () {
    studentsForTutoriumData.forEach(e => {
      e.absences.forEach(absence => {
        absences.push(absence)
        if (tutorId === '') {
          tutorId = absence.student.tutorium.tutor.id
        }
      })
    })
  }

  const columns = useMemo(() => [
    {
      Header: 'Stunden',
      accessor: 'lessonIndex'
    },
    {
      Header: 'Vorname',
      accessor: 'student.firstName'
    },
    {
      Header: 'Nachname',
      accessor: 'student.lastName'
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
          <IconButton isDisabled={self.role !== Role.Coordinator && row.original.submittedBy !== self.id && tutorId !== self.id} variant="outline" aria-label="Löschen" icon={<DeleteIcon />} onClick={() => {
            // setRowId(row.original.id)
            // absenceDeleteAlertDialog.onOpen()
          }} />
        </Flex>
      )
    }
  ], [/* absenceDeleteAlertDialog */self.id, self.role, tutorId])

  const dates = []

  function getAbsencesDates () {
    absences.forEach(e => {
      dates.push(e.date)
    })

    const unique = [...Array.from(new Set(dates))]
    unique.sort()
    unique.reverse()

    return unique
  }

  function getAbsenceForDate (date: string) {
    return absences.filter(absences => absences.date === date)
  }

  function checkIfAbsencesDataIsEmpty () {
    if (absences.length > 0) {
      return (
        <Flex w="full" padding={5}>
          <Text fontSize="24" fontWeight="bold">Unentschuldigte Fehlzeiten</Text>
          <Button marginLeft="auto" leftIcon={<AddIcon />} /* onClick={TODO} */>Entschuldigung hinzufügen</Button>
          <IconButton ml={4} variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon />} onClick={() => { studentsForTutoriumQuery.refetch() }}></IconButton>
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
      {getAbsences()}
      {console.log(absences)}
      <SimpleGrid>
        <Flex direction="column" alignItems="center" minW="300px" minH="600px" margin={5}>
          {checkIfAbsencesDataIsEmpty()}
          {studentsForTutoriumQuery.loading && (<Spinner />)}
          {studentsForTutoriumQuery.error != null && (<Heading>Error!</Heading>)}
          {studentsForTutoriumQuery.data != null && (
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
      {/* <DeleteAbsenceAlertDialog isOpen={absenceDeleteAlertDialog.isOpen} onClose={absenceDeleteAlertDialog.onClose} rowId={rowId} /> */}
    </PageScaffold>
  )
}

export default WithAuth(Tutorium, { roles: [Role.Coordinator] })
