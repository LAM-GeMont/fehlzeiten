import { AddIcon, DeleteIcon, RepeatIcon, SearchIcon } from '@chakra-ui/icons'
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Spinner, Button, IconButton, useDisclosure, useToast, Text, Box, Flex, SimpleGrid, Heading, Center, AlertIcon, chakra, Input, InputGroup, InputLeftElement, Link, Spacer, Tag } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import React, { useMemo } from 'react'
import { FaEdit } from 'react-icons/fa'
import { PageScaffold } from '../../components/PageScaffold'
import { CardTable } from '../../components/BetterTable'
import NextLink from 'next/link'
import WithAuth, { WithAuthProps } from '../../components/withAuth'
import { Role, useTutoriumQuery } from '../../generated/graphql'
import { toastApolloError } from '../../util'
import { DeleteStudentFromTutoriumModal } from '../../components/DeleteStudentFromTutoriumModal'
import { EditStudentModal } from '../../components/EditStudentModal'
import { AddStudentToTutoriumModal } from '../../components/AddStudentToTutoriumModal'
import { Row, useAsyncDebounce } from 'react-table'

interface Props extends WithAuthProps { }

const StudentsOfTutoriumPage: React.FC<Props> = ({ self }) => {
  const studentEditModal = useDisclosure()
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
    onError: errors => toastApolloError(toast, errors)
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
          <IconButton isDisabled={self.role === 'TEACHER'} variant="outline" aria-label="Bearbeiten" icon={<FaEdit />} onClick={ () => editStudent(row)} />
          <Box mr={2}></Box>
          <IconButton isDisabled={self.role === 'TEACHER'} variant="outline" aria-label="Löschen" icon={<DeleteIcon />} onClick={ () => deleteStudentFromTutorium(row)} />
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
    return <Center h="100vh"><Spinner /></Center>
  }

  if (tutoriumQuery.error != null) {
    return (
        <PageScaffold role={self.role}>
          <Center h="100vh" color="red">
            <AlertIcon />
            <Heading>Fehler beim Laden der Daten</Heading>
          </Center>
        </PageScaffold>
    )
  }

  if (tutorium == null) {
    <ErrorPage statusCode={404} />
  }

  return (
        <PageScaffold role={self.role}>
          <SimpleGrid>
            <Text fontSize="30" fontWeight="bold">{tutorium.name}</Text>
            {tutorium.tutor != null && <Text fontSize="26">{tutorium.tutor.name}</Text>}
            <Flex direction="column" alignItems="center" minW="300px" minH="600px">
              <Accordion allowToggle mt={5} allowMultiple>
                <AccordionItem>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontSize="24" fontWeight="bold">
                      Schüler
                    </Box>
                    <AccordionIcon></AccordionIcon>
                  </AccordionButton>
                  <AccordionPanel>
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
                              <Button flexGrow={2} leftIcon={<AddIcon />} onClick={addStudentToTutoriumModal.onOpen}>Schüler zu Tutorium hinzufügen</Button>
                              <IconButton variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon />} onClick={() => { tutoriumQuery.refetch() }}></IconButton>
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
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontSize="24" fontWeight="bold">
                      Unentschuldigte Fehlzeiten
                    </Box>
                    <Spacer minW={2}/>
                    <AccordionIcon></AccordionIcon>
                  </AccordionButton>
                  <AccordionPanel>
                  {dates.map((date: string) => {
                    return (
                      <Flex wrap="wrap" maxW="full" mt={5} key={date} w="full" border="1px" borderColor="gray.300" borderRadius="md" boxShadow="lg" p="3" rounded="md" bg="white" mb={4}>
                        <Text fontSize="22">{new Date(date).toLocaleDateString()}</Text>
                        <CardTable columns={columnsAbsences} data={absences.filter(absence => absence.date === date).sort((a, b) => -a.lessonIndex + b.lessonIndex)}
                          keyFn={(row) => row.original.id}
                          rowFn={(row: Row<any>) => (
                            <Flex w="full" maxW="full" boxShadow="sm" _hover={{ boxShadow: 'md' }} borderRadius="md" alignItems="center" px={4} py={2}>
                              <Flex flexDirection="column">
                                <Text fontWeight="bold">{row.cells[0].render('Cell')}. Stunde</Text>
                                <Text fontWeight="bold">{row.cells[3].render('Cell')} {row.cells[4].render('Cell')}</Text>
                                <Text>Eingereicht von <span style={{ fontWeight: 'bold' }}>{row.cells[1].render('Cell')}</span></Text>
                              </Flex>
                              <Spacer />
                              <Flex flexDirection="column">
                                {row.cells[2].value ? (<Tag mb={2} bgColor="blue.400" color="white">Klausur</Tag>) : (<></>)}
                                <Tag mb={2} colorScheme="red">Unentschuldigt</Tag>
                              </Flex>
                            </Flex>
                          )}
                        />
                      </Flex>)
                  })}
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Flex>
          </SimpleGrid>
          <AddStudentToTutoriumModal isOpen={addStudentToTutoriumModal.isOpen} onClose={addStudentToTutoriumModal.onClose} studentId={rowId} firstName={rowFirstName} lastName={rowLastName} tutoriumId={tutorium.id} />
          <EditStudentModal isOpen={studentEditModal.isOpen} onClose={studentEditModal.onClose} studentId={rowId} firstName={rowFirstName} lastName={rowLastName} tutoriumId={tutorium.id} />
          <DeleteStudentFromTutoriumModal isOpen={deleteStudentFromTutoriumModal.isOpen} onClose={deleteStudentFromTutoriumModal.onClose} rowId={rowId} firstName={rowFirstName} lastName={rowLastName} tutoriumName={tutorium.name} />
        </PageScaffold>
  )
}

export default WithAuth(StudentsOfTutoriumPage, { roles: [Role.Coordinator] })
