import { AddIcon, ArrowBackIcon, DeleteIcon, RepeatIcon, SearchIcon, Icon } from '@chakra-ui/icons'
import { Tabs, Tab, TabList, TabPanels, TabPanel, Spinner, Button, IconButton, useDisclosure, useToast, Text, Box, Flex, SimpleGrid, Heading, Center, AlertIcon, chakra, Input, InputGroup, InputLeftElement, Link, Spacer, Tag } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import React, { useMemo } from 'react'
import { FaCalendarCheck, FaEdit, FaUser } from 'react-icons/fa'
import { PageScaffold } from '../../components/PageScaffold'
import { CardTable } from '../../components/BetterTable'
import NextLink from 'next/link'
import WithAuth, { WithAuthProps } from '../../components/withAuth'
import { useTutoriumQuery, useCreateExcuseLessonsMutation } from '../../generated/graphql'
import { toastApolloError } from '../../util'
import { DeleteStudentFromTutoriumModal } from '../../components/DeleteStudentFromTutoriumModal'
import { EditStudentModal } from '../../components/EditStudentModal'
import { AddStudentToTutoriumModal } from '../../components/AddStudentToTutoriumModal'
import { Row, useAsyncDebounce } from 'react-table'
import { DeleteAbsenceAlertDialog } from '../../components/DeleteAbsenceAlertDialog'

interface Props extends WithAuthProps { }

const StudentsOfTutoriumPage: React.FC<Props> = ({ self }) => {
  const studentEditModal = useDisclosure()
  const absenceDeleteAlertDialog = useDisclosure()
  const deleteStudentFromTutoriumModal = useDisclosure()
  const addStudentToTutoriumModal = useDisclosure()
  const toast = useToast()

  const [rowId, setRowId] = React.useState('')
  const [rowFirstName, setRowFirstName] = React.useState('')
  const [rowLastName, setRowLastName] = React.useState('')

  const router = useRouter()
  const { id } = router.query

  const tutoriumQuery = useTutoriumQuery({
    variables: { tutoriumId: id.toString() },
    onError: errors => toastApolloError(toast, errors),
    pollInterval: 60000
  })

  const [createExcuseLessons] = useCreateExcuseLessonsMutation({
    onError: errors => toastApolloError(toast, errors),
    refetchQueries: 'all'
  })

  const tutorium = tutoriumQuery.data?.tutorium
  const students = tutoriumQuery.data?.tutorium.students
  const absences = []

  tutoriumQuery.data?.tutorium.students.forEach(e => {
    e.absences.forEach(absence => {
      if (absence.excused === false) {
        absences.push(absence)
      }
    })
  })

  const dates = Array.from(new Set(absences.map(absence => absence.date))).sort().reverse()

  console.log(absences)

  const openEdit = studentEditModal.onOpen
  const editStudent = React.useCallback((row) => {
    setRowId(row.original.id)
    setRowFirstName(row.original.firstName)
    setRowLastName(row.original.lastName)
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
      Cell: ({ row }) => (
        <Flex justifyContent="center">
          <IconButton isDisabled={self.role === 'TEACHER'} variant="outline" aria-label="Bearbeiten" icon={<FaEdit/>} onClick={() => editStudent(row)} mr={2}/>
          <IconButton isDisabled={self.role === 'TEACHER'} variant="outline" aria-label="Löschen" icon={<DeleteIcon/>} onClick={() => deleteStudentFromTutorium(row)}/>
        </Flex>
      )
    }
  ], [editStudent, deleteStudentFromTutorium, self.role])

  const columnsAbsences = useMemo(() => [
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
      accessor: 'student.firstName'
    },
    {
      Header: '',
      accessor: 'student.lastName'
    },
    {
      Header: 'Aktionen',
      Cell: ({ row }) => (
        <Flex>
          <IconButton size="sm" ml={2} variant="outline" aria-label="Löschen" icon={<DeleteIcon />} onClick={() => {
            setRowId(row.original.id)
            absenceDeleteAlertDialog.onOpen()
          }} />
          <IconButton size="sm" ml={2} isDisabled={(row.original.excused === true)} variant="outline" aria-label="Entschuldigen" icon={<FaCalendarCheck />} onClick={async () => {
            setRowId(row.original.id)
            const res = await createExcuseLessons({
              variables: {
                data: {
                  startDate: row.original.date,
                  endDate: row.original.date,
                  studentId: row.original.student.id,
                  lessons: row.original.lessonIndex
                }
              },
              refetchQueries: 'all'
            })
            if (res.errors) {
              res.errors.forEach(error => {
                toast({
                  title: 'Fehler beim Erstellen der Entschuldigung',
                  description: error.message == null ? 'Unbekannter Fehler' : error.message,
                  status: 'error',
                  isClosable: true
                })
              })
            } else {
              toast({
                title: 'Entschuldigung erfolgreich eingetragen',
                status: 'success',
                isClosable: true
              })
            }
          }} />
        </Flex>
      )
    }
  ], [])

  const data = useMemo(() => {
    if (students != null) {
      return students
    } else {
      return []
    }
  }, [students])

  const setFilter = useAsyncDebounce((filter, set) => set(filter), 200)

  if (tutoriumQuery.loading) {
    return <Center h="100vh"><Spinner/></Center>
  }

  if (tutoriumQuery.error != null) {
    return (
      <PageScaffold role={self.role}>
        <Center h="100vh" color="red">
          <AlertIcon/>
          <Heading>Fehler beim Laden der Daten</Heading>
        </Center>
      </PageScaffold>
    )
  }

  if (tutorium == null) {
    <ErrorPage statusCode={404}/>
  }

  return (
    <PageScaffold role={self.role}>
      <SimpleGrid>
        <NextLink href='/tutorium'>
          <Link mb={4}>
            <Flex alignItems="center">
              <ArrowBackIcon></ArrowBackIcon>
              <Text>Zurück zur Übersicht</Text>
            </Flex>
          </Link>
        </NextLink>
        <Heading as="h1" size="xl">{tutorium.name} <span style={{ color: 'grey', fontWeight: 'normal', fontSize: '24px' }}>Tutorium</span></Heading>
        {tutorium.tutor != null && <Heading as="h1" size="md">Tutor: {tutorium.tutor.name}</Heading>}
        <Flex direction="column" alignItems="center" minW="300px" minH="600px">
          <Tabs isFitted variant="soft-rounded" width="100%" pt={4}>
            <TabList>
              <Tab>Schüler</Tab>
              <Tab>Unent. Fehlzeiten</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {tutoriumQuery.loading && (<Spinner/>)}
                  {tutoriumQuery.error != null && (<Heading>Error!</Heading>)}
                  {tutoriumQuery.data != null && (
                    <Box w="full" borderRadius="md" p="2" bg="white" mb={4}>
                      <CardTable data={data} columns={columns}
                                before={(table) => (
                                  <Flex wrap="wrap" justify="flex-end" maxW="full" mb={4}>
                                    <InputGroup flexShrink={10} w="full" maxW="full" mb={2}>
                                      <InputLeftElement>
                                        <SearchIcon/>
                                      </InputLeftElement>
                                      <Input width="full" value={undefined} onChange={e => setFilter(e.target.value, table.setGlobalFilter)}/>
                                    </InputGroup>
                                    <Flex flexGrow={2}>
                                      <Button mr={2} flexGrow={2} leftIcon={<AddIcon/>} onClick={addStudentToTutoriumModal.onOpen}>Schüler zu Tutorium hinzufügen</Button>
                                      <IconButton
                                        variant="outline"
                                        aria-label="Daten neu laden"
                                        icon={<RepeatIcon/>}
                                        onClick={() => {
                                          tutoriumQuery.refetch()
                                        }}
                                      />
                                    </Flex>
                                  </Flex>
                                )}

                                sortableColumns={['firstName', 'lastName']}

                                keyFn={(row) => row.original.id}

                                rowFn={(row: Row<any>) => (
                                  <Flex w="full" transition="all" transitionDuration="200ms" boxShadow="sm" _hover={{ boxShadow: 'md' }} borderRadius="md" alignItems="center" px={4} py={2}>
                                    <NextLink href={`/student/${row.original.id}`}>
                                      <Link flexGrow={10}>{row.cells[0].render('Cell')}{' '}<chakra.span color="black">{row.cells[1].render('Cell')}</chakra.span></Link>
                                    </NextLink>
                                    {row.cells[2].render('Cell')}
                                  </Flex>
                                )}
                      />
                    </Box>
                  )}
              </TabPanel>
              <TabPanel px={0} py={4}>
              {dates.map((date: string) => {
                return (
                  <Flex wrap="wrap" maxW="full" mt={5} key={date} w="full" border="1px" borderColor="gray.300" borderRadius="md" boxShadow="lg" pt="3" pb="3" rounded="md" bg="white" mb={4}>
                    <Text fontSize="22" pl="3">{new Date(date).toLocaleDateString()}</Text>
                    <CardTable columns={columnsAbsences} data={absences.filter(absence => absence.date === date).sort((a, b) => -a.lessonIndex + b.lessonIndex)}
                      keyFn={(row) => row.original.id}
                      rowFn={(row: Row<any>) => (
                        <Flex w="full" maxW="full" boxShadow="sm" _hover={{ boxShadow: 'md' }} borderRadius="md" alignItems="center" px={4} py={2}>
                          <Flex flexDirection="column">
                            <Text fontSize="sm" fontWeight="bold">{row.cells[0].render('Cell')}. Stunde</Text>
                            <Text fontSize="sm" fontWeight="bold">{row.cells[3].render('Cell')} {row.cells[4].render('Cell')}</Text>
                            <Text fontSize="sm"> <Icon as={FaUser} mr={2} mb={1} />{row.cells[1].render('Cell')}</Text>
                          </Flex>
                          <Spacer />
                          <Flex flexDirection="column">
                            {row.cells[2].value ? (<Tag fontSize="sm" mb={2} bgColor="blue.400" color="white">Klausur</Tag>) : (<></>)}
                            <Tag fontSize="sm" mb={2} colorScheme="red">Unentschuldigt</Tag>
                          </Flex>
                          {row.cells[5].render('Cell')}
                        </Flex>
                      )}
                    />
                  </Flex>)
              })}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Flex>
      </SimpleGrid>
      <AddStudentToTutoriumModal
        isOpen={addStudentToTutoriumModal.isOpen}
        onClose={addStudentToTutoriumModal.onClose}
        studentId={rowId}
        firstName={rowFirstName}
        lastName={rowLastName}
        tutoriumId={tutorium.id}/>
      <EditStudentModal
        isOpen={studentEditModal.isOpen}
        onClose={studentEditModal.onClose}
        studentId={rowId}
        firstName={rowFirstName}
        lastName={rowLastName}
        tutoriumId={tutorium.id}/>
      <DeleteStudentFromTutoriumModal
        isOpen={deleteStudentFromTutoriumModal.isOpen}
        onClose={deleteStudentFromTutoriumModal.onClose}
        rowId={rowId}
        firstName={rowFirstName}
        lastName={rowLastName}
        tutoriumName={tutorium.name}/>
      <DeleteAbsenceAlertDialog
        isOpen={absenceDeleteAlertDialog.isOpen}
        onClose={absenceDeleteAlertDialog.onClose}
        rowId={rowId}/>
    </PageScaffold>
  )
}

export default WithAuth(StudentsOfTutoriumPage)
