import { AddIcon, DeleteIcon, RepeatIcon, WarningTwoIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, Heading, IconButton, SimpleGrid, Spinner, Text, useDisclosure, useToast, Center } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { PageScaffold } from '../../components/PageScaffold'
import SortedTable from '../../components/SortedTableAbsences'
import WithAuth, { WithAuthProps } from '../../components/withAuth'
import { Role, useAbsencesForStudentQuery } from '../../generated/graphql'
import { toastApolloError } from '../../util'
import { DeleteAbsenceAlertDialog } from '../../components/DeleteAbsenceAlertDialog'
import ErrorPage from 'next/error'

interface Props extends WithAuthProps { }

const Student: React.FC<Props> = ({ self }) => {
  const absenceDeleteAlertDialog = useDisclosure()
  const router = useRouter()
  const { id } = router.query

  const [rowId, setRowId] = React.useState('')

  const toast = useToast()

  const studentQuery = useAbsencesForStudentQuery({
    variables: {
      studentId: id.toString()
    },
    onError: errors => toastApolloError(toast, errors)
  })

  const absences = studentQuery.data?.student?.absences || []
  const student = studentQuery.data?.student

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
        <Center h="100vh" color="red.500">
          <WarningTwoIcon boxSize={7} pt={1} mr={5}/>
          <Heading>Fehler beim Laden der Daten</Heading>
        </Center>
      </PageScaffold>
    )
  }

  if (student == null) {
    <ErrorPage statusCode={404} />
  }

  return (
    <PageScaffold role={self.role}>
      <SimpleGrid>
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
              <Flex w="full" padding={5}>
                <Text fontSize="24" fontWeight="bold">Fehlzeiten</Text>
                <Button marginLeft="auto" leftIcon={<AddIcon />} /* onClick={TODO} */>Entschuldigung hinzufügen</Button>
                <IconButton ml={4} variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon />} onClick={() => { studentQuery.refetch() }} />
              </Flex>
              {dates.map(date => {
                return (
                  <Box key={date} w="full" border="1px" borderColor="gray.300" borderRadius="md" boxShadow="lg" p="6" rounded="md" bg="white" mb={4}>
                    <Text fontSize="22" pl={2}>{new Date(date).toLocaleDateString()}</Text>
                    <SortedTable columns={columns} data={absences.filter(absence => absence.date === date)} />
                  </Box>)
              })}
            </>
          )}
        </Flex>
      </SimpleGrid>
      <DeleteAbsenceAlertDialog isOpen={absenceDeleteAlertDialog.isOpen} onClose={absenceDeleteAlertDialog.onClose} rowId={rowId} />
    </PageScaffold>
  )
}

export default WithAuth(Student, { roles: [Role.Coordinator] })
