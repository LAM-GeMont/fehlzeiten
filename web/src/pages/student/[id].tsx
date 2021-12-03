import { AddIcon, ArrowBackIcon, DeleteIcon, RepeatIcon, WarningTwoIcon, Icon } from '@chakra-ui/icons'
import { Link, Select, Box, Button, Flex, Heading, IconButton, SimpleGrid, Spinner, Text, useDisclosure, useToast, Center, Tag } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import React, { useMemo } from 'react'
import { PageScaffold } from '../../components/PageScaffold'
import WithAuth, { WithAuthProps } from '../../components/withAuth'
import { Role, useAbsencesForStudentQuery, useSemestersQuery } from '../../generated/graphql'
import { toastApolloError } from '../../util'
import { DeleteAbsenceAlertDialog } from '../../components/DeleteAbsenceAlertDialog'
import ErrorPage from 'next/error'
import ExcuseModal from '../../components/ExcuseModal'
import { CardTable } from '../../components/BetterTable'
import { Row } from 'react-table'
import { FaUser } from 'react-icons/fa'

interface Props extends WithAuthProps { }

const Student: React.FC<Props> = ({ self }) => {
  const absenceDeleteAlertDialog = useDisclosure()
  const excuseModal = useDisclosure()
  const router = useRouter()
  const { id } = router.query

  const [rowId, setRowId] = React.useState('')
  const [selectedSemester, setSelectedSemester] = React.useState<string>()

  const toast = useToast()

  const studentQuery = useAbsencesForStudentQuery({
    variables: {
      studentId: id.toString(),
      semesterId: selectedSemester
    },
    onError: errors => toastApolloError(toast, errors)
  })

  const semestersQuery = useSemestersQuery({
    onError: errors => toastApolloError(toast, errors)
  })

  const absences = studentQuery.data?.student?.absences || []
  const student = studentQuery.data?.student
  const semesters = semestersQuery.data?.semesters || []

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
      Header: '',
      accessor: 'excused'
    },
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
        <Flex direction="column" alignItems="center" minW="300px" minH="600px">
          {dates.length < 1 &&
            <Flex w="full" padding={5}>
              <Text fontSize="24" fontWeight="bold">Es wurden noch keine Fehlzeiten erfasst...</Text>
            </Flex>
          }
          {dates.length >= 1 && (
            <>
              <Flex w="full" flexWrap="wrap" pt={8}>
                <Text pr={4} mb={5} fontSize="24" fontWeight="bold">Fehlzeiten</Text>
                <Flex flexGrow={10} mb={5}>
                  <Button ml="auto" leftIcon={<AddIcon />} onClick={() => { excuseModal.onOpen() }} flexGrow={10}>Entschuldigung hinzufügen</Button>
                  <IconButton ml={4} variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon />} onClick={() => { studentQuery.refetch() }} />
                </Flex>
              </Flex>
              <Select variant='outline' placeholder='Semester auswählen' value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)}>
                {semesters.map(semester => {
                  return (
                    <option value={semester.id} key={semester.id}>{semester.name}</option>
                  )
                })}
              </Select>
              {dates.map(date => {
                return (
                  <Box mt={5} key={date} w="full" border="1px" borderColor="gray.300" borderRadius="md" boxShadow="lg" p="6" rounded="md" bg="white" mb={4}>
                    <Text fontSize="22" pb={5}>{new Date(date).toLocaleDateString()}</Text>
                    <CardTable data={absences.filter(absence => absence.date === date).sort((a, b) => -a.lessonIndex + b.lessonIndex)} columns={columns}
                      keyFn={(row) => row.original.id}

                      rowFn={(row: Row<any>) => (
                        <Box w="full" transition="all" transitionDuration="200ms" boxShadow="sm" _hover={{ boxShadow: 'md' }} borderRadius="md" borderWidth={2} borderColor={row.cells[3].value ? 'green.200' : 'gray.200'}>
                        <Flex mx={-2} alignItems="center" px={4} py={2} flexWrap="wrap">
                          <Text fontWeight="semibold" mx={2}>{row.cells[0].render('Cell')}{' '}</Text>
                          <Flex alignItems="center" flexGrow={5} justifyContent="flex-end" my={2} mx={2} flexBasis={100}>
                            {row.cells[2].value &&
                              <Tag ml={2} colorScheme="primary">Klausur</Tag>
                            }
                            {row.cells[3].value &&
                              <Tag ml={2} colorScheme="green">Entschuldigt</Tag>
                            }
                          </Flex>
                          <Flex alignItems="center" justifyContent="space-between" flexGrow={2} mx={2}>
                            <Text textAlign="right" mr={2}><Icon as={FaUser} mr={2} mb={1} />{row.cells[1].render('Cell')}</Text>
                            {row.cells[4].render('Cell')}
                          </Flex>
                        </Flex>
                        </Box>
                      )}
                    />
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
