import { AddIcon, ArrowBackIcon, CalendarIcon, DeleteIcon, RepeatIcon, TimeIcon, WarningTwoIcon } from '@chakra-ui/icons'
import {
  Link,
  Select,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  SimpleGrid,
  Spinner,
  Text,
  useDisclosure,
  useToast,
  Center,
  StatGroup, Stat, StatNumber, StatLabel, Spacer, Tag, Tab, TabList, TabPanel, TabPanels, Tabs, chakra
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import React, { useMemo } from 'react'
import { PageScaffold } from '../../components/PageScaffold'
import WithAuth, { WithAuthProps } from '../../components/withAuth'
import { Role, useStudentOverviewQuery, useSemestersQuery } from '../../generated/graphql'
import { toastApolloError } from '../../util'
import { DeleteAbsenceAlertDialog } from '../../components/DeleteAbsenceAlertDialog'
import ErrorPage from 'next/error'
import ExcuseModal from '../../components/ExcuseModal'
import { CardTable } from '../../components/BetterTable'
import { Row } from 'react-table'
import { DeleteExcuseAlertDialog } from '../../components/DeleteExcuseAlertDialog'

interface Props extends WithAuthProps { }

const emptySummary = {
  excusedDays: 0,
  excusedHours: 0,
  unexcusedDays: 0,
  unexcusedHours: 0
}

const Student: React.FC<Props> = ({ self }) => {
  const absenceDeleteAlertDialog = useDisclosure()
  const excuseDeleteAlertDialog = useDisclosure()
  const excuseModal = useDisclosure()
  const router = useRouter()
  const { id } = router.query

  const [rowId, setRowId] = React.useState('')
  const [selectedSemester, setSelectedSemester] = React.useState<string>()

  const toast = useToast()

  const studentQuery = useStudentOverviewQuery({
    variables: {
      studentId: id.toString(),
      semesterId: selectedSemester
    },
    onError: errors => toastApolloError(toast, errors),
    pollInterval: 60000
  })

  const semestersQuery = useSemestersQuery({
    onError: errors => toastApolloError(toast, errors),
    pollInterval: 60000
  })

  const student = studentQuery.data?.student
  const summary = studentQuery.data?.student?.absenceSummary || emptySummary
  const absences = studentQuery.data?.student?.absences || []
  const semesters = semestersQuery.data?.semesters || []
  const excuses = studentQuery.data?.student?.excuses || []

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
        <IconButton ml={2} isDisabled={self.role !== Role.Coordinator && row.original.submittedBy !== self.id && student.tutorium?.tutor?.id !== self.id} variant="outline" aria-label="Löschen" icon={<DeleteIcon />} onClick={() => {
          setRowId(row.original.id)
          absenceDeleteAlertDialog.onOpen()
        }} />
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
          <Link mb={4}>
            <Flex alignItems="center">
              <ArrowBackIcon/>
              <Text>Zurück zur Übersicht</Text>
            </Flex>
          </Link>
        </NextLink>
        <Heading as='h1' size='xl'>{student.firstName + ' ' + student.lastName} <span style={{ color: 'grey', fontWeight: 'normal', fontSize: '24px' }}>Schüler:in</span></Heading>
        <Heading as='h2' size='md' fontWeight='normal'>{student.tutorium?.name}</Heading>
        <Flex direction="column" minW="300px" minH="600px" mt={5}>
          <Tabs isFitted variant="soft-rounded" width="100%" p={4}>
            <TabList>
              <Tab>Fehlzeiten</Tab>
              <Tab>Entschuldigungen</Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0} py={4}>
                {dates.length < 1 &&
                  <Flex w="full" padding={5}>
                    <Text fontSize="24" fontWeight="bold">Es wurden noch keine Fehlzeiten erfasst...</Text>
                  </Flex>
                }
                {dates.length >= 1 && (
                  <>
                    <Flex w="full" flexWrap="wrap" pt={2}>
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
                    <Heading as='h2' size='md' mt={3} mb={3}>Zusammenfassung</Heading>
                    <StatGroup
                      alignItems="end"
                      border="1px solid var(--chakra-colors-gray-200)"
                      borderRadius="md"
                      display={{ base: 'grid', md: 'flex' }}
                      gridTemplateColumns="1fr 1fr"
                      gridRowGap={3}
                      padding={3}
                      w="100%"
                    >
                      <Stat display="flex" flexDir="column" justifyContent="spaceBetween">
                        <StatLabel>Tage</StatLabel>
                        <StatNumber>{ summary.excusedDays + summary.unexcusedDays }</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>davon unentschuldigt</StatLabel>
                        <StatNumber>{ summary.unexcusedDays }</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Einzelstunden</StatLabel>
                        <StatNumber>{ summary.excusedHours + summary.unexcusedHours }</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>davon unentschuldigt</StatLabel>
                        <StatNumber>{ summary.unexcusedHours }</StatNumber>
                      </Stat>
                    </StatGroup>
                    {dates.map((date: string) => {
                      return (
                        <Box mt={5} key={date} w="full" border="1px" borderColor="gray.300" borderRadius="md" boxShadow="lg" p="3" rounded="md" bg="white" mb={4}>
                          <Text fontSize="22">{new Date(date).toLocaleDateString()}</Text>
                          <CardTable columns={columns} data={absences.filter(absence => absence.date === date).sort((a, b) => -a.lessonIndex + b.lessonIndex)}
                            keyFn={(row) => row.original.id}
                            rowFn={(row: Row<any>) => (
                              <Flex w="full" transition="all" transitionDuration="200ms" boxShadow="sm" _hover={{ boxShadow: 'md' }} borderRadius="md" alignItems="center" px={4} py={2}>
                                <Flex flexDirection="column">
                                  <Text fontWeight="bold">{row.cells[0].render('Cell')}. Stunde</Text>
                                  <Text>Eingereicht von <span style={{ fontWeight: 'bold' }}>{row.cells[1].render('Cell')}</span></Text>
                                </Flex>
                                <Spacer />
                                <Flex flexDirection="column">
                                  {row.cells[3].value ? (<Tag mb={2} bgColor="blue.400" color="white">Klausur</Tag>) : (<></>)}
                                  {row.cells[3].value ? (<Tag colorScheme="green" variant="solid">Entschuldigt</Tag>) : (<></>)}
                                </Flex>
                                {row.cells[4].render('Cell')}
                              </Flex>
                            )}
                          />
                        </Box>)
                    })}
                  </>
                )}

              </TabPanel>
              <TabPanel px={0} py={4}>
                <>
                  <Flex w="full" flexWrap="wrap" pt={2}>
                    <Flex flexGrow={10} mb={5}>
                      <Button ml="auto" leftIcon={<AddIcon />} onClick={() => { excuseModal.onOpen() }} flexGrow={10}>Entschuldigung hinzufügen</Button>
                      <IconButton ml={4} variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon />} onClick={() => { studentQuery.refetch() }} />
                    </Flex>
                  </Flex>
                  {excuses.length < 1 &&
                    <Flex w="full" padding={5}>
                      <Text fontSize="24" fontWeight="bold">Es wurden noch keine Entschuldigungen erfasst...</Text>
                    </Flex>
                  }
                  {excuses.length >= 1 && (
                    excuses.slice().sort((a, b) => { return a.startDate === b.startDate ? 0 : (a.startDate < b.startDate ? 1 : -1) }).map((excuse) => {
                      return (
                        <Flex mt={5} key={excuse.id} w="full" border="1px" borderColor="gray.300" borderRadius="md" boxShadow="lg" p="3" rounded="md" bg="white" mb={4} alignItems="center">
                          {excuse.lessons == null &&
                            <>
                              <CalendarIcon boxSize={4} mr={4} />
                              <Flex flexWrap="wrap">
                                <>
                                  <chakra.span fontWeight="semibold">{new Date(excuse.startDate).toLocaleDateString()}</chakra.span>
                                  {excuse.startDate !== excuse.endDate &&
                                    <chakra.span fontWeight="semibold">-{new Date(excuse.endDate).toLocaleDateString()}</chakra.span>
                                  }
                                </>
                              </Flex>
                              <Text ml="auto" mr={2}>{Math.round((new Date(excuse.endDate).getTime() - new Date(excuse.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} Tag(e)</Text>
                            </>
                          }
                          {excuse.lessons != null &&
                            <>
                              <TimeIcon boxSize={4} mr={4} />
                              <Text><chakra.span fontWeight="semibold">{new Date(excuse.startDate).toLocaleDateString()}</chakra.span>: Stunde {excuse.lessons.map((lesson, i) => {
                                if (i === excuse.lessons.length - 1) {
                                  return lesson
                                }
                                if (i === excuse.lessons.length - 2) {
                                  return lesson + ' und '
                                }
                                return lesson + ', '
                              })}</Text>
                              <Text ml="auto" mr={2}>{excuse.lessons.length} Stunde(n)</Text>
                            </>
                          }
                          <IconButton isDisabled={self.role !== Role.Coordinator && excuse.submittedBy.id !== self.id && student.tutorium?.tutor?.id !== self.id} variant="outline" aria-label="Löschen" icon={<DeleteIcon />} onClick={() => {
                            setRowId(excuse.id)
                            excuseDeleteAlertDialog.onOpen()
                          }} />
                        </Flex>
                      )
                    })
                  )}
                </>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Flex>
      </SimpleGrid>
      <DeleteAbsenceAlertDialog isOpen={absenceDeleteAlertDialog.isOpen} onClose={absenceDeleteAlertDialog.onClose} rowId={rowId} />
      <DeleteExcuseAlertDialog isOpen={excuseDeleteAlertDialog.isOpen} onClose={excuseDeleteAlertDialog.onClose} rowId={rowId} />
      <ExcuseModal isOpen={excuseModal.isOpen} onClose={excuseModal.onClose} studentId={student.id}/>
    </PageScaffold>
  )
}

export default WithAuth(Student, { roles: [Role.Coordinator] })
