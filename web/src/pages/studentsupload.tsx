import { Box, Flex, SimpleGrid, Text } from '@chakra-ui/layout'
import React, { useMemo, useRef, useState } from 'react'
import { Input, Button, Tag, Spacer, useToast } from '@chakra-ui/react'
import { PageScaffold } from '../components/PageScaffold'
import { CardTable } from '../components/BetterTable'
import WithAuth, { WithAuthProps } from '../components/withAuth'
import { Role, useStudentsQuery, useCreateStudentMutation } from '../generated/graphql'
import { Row } from 'react-table'
import { toastApolloError } from '../util'

interface Props extends WithAuthProps {}

interface CsvEntry {
  firstName: string,
  lastName: string,
  isValid: boolean
}

const Studentsupload: React.FC<Props> = ({ self }) => {
  const toast = useToast()
  const [csvLines, setCsvLines] = useState([])

  const [create] = useCreateStudentMutation({
    onError: errors => toastApolloError(toast, errors)
  })

  const studentsQuery = useStudentsQuery({
    onError: errors => toastApolloError(toast, errors)
  })

  const data = useMemo(() => {
    if (studentsQuery.data?.students != null) {
      return studentsQuery.data.students
    } else {
      return []
    }
  }, [studentsQuery.data])

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
      Header: 'Bereits vorhanden',
      accessor: 'isValid'
    }
  ], [])

  const handleChange = (event) => {
    const filePath = event.target.files[0]
    if ((filePath != null) && (filePath.type === 'application/vnd.ms-excel' || filePath.type === 'text/csv')) {
      const reader = new FileReader()
      reader.readAsText(filePath)
      filePath.text().then(text => {
        const lines: string[] = text.split('\r\n')
        const header: string[] = lines[0].split(';')
        if (header[0].trim() === 'Name' && header[1].trim() === 'Vorname' && header[2].trim() === 'Klasse') {
          lines.shift()
          const entries: CsvEntry[] = []
          lines.forEach((line) => {
            const elements: string[] = line.split(';')
            if ((elements[0].trim() !== '' || elements[0].trim() != null) || (elements[1].trim() !== '' || elements[1].trim() != null)) {
              let valid = true
              data.forEach(student => {
                if (student.lastName === elements[0].trim()) {
                  if (student.firstName === elements[1].trim()) {
                    valid = false
                  }
                }
              })
              entries.forEach(student => {
                if (student.lastName === elements[0].trim()) {
                  if (student.firstName === elements[1].trim()) {
                    valid = false
                  }
                }
              })
              const entry: CsvEntry = {
                firstName: elements[1].trim(),
                lastName: elements[0].trim(),
                isValid: valid
              }
              entries.push(entry)
            }
          })
          console.log(header)
          console.log(entries)
          setCsvLines(entries)
        }
      })
    }
  }

  const fileInput = useRef(null)

  return (
    <PageScaffold role={self.role}>
      <SimpleGrid>
        <Text mb={2} fontSize="30" fontWeight="bold">Schüler importieren</Text>
        <Text>Zum importieren wird eine .csv Datei in mit den Schülern und der Kopfzeile:</Text>
        <Text mb={2} mt={2} ml={3} as="i" fontWeight="bold">Name; Nachname; Klasse</Text>
        <Text>benötigt. </Text>
        <Input style={{ display: 'none' }} type="file" onChange={handleChange} ref={fileInput}></Input>
        <Button bg='#001955' color='white' mt={2} onClick={ () => fileInput.current.click()}>.CSV Datei hochladen</Button>
        {csvLines.length > 0 && (
          <Box mt={5} w="full" borderRadius="md" pt="3" pb="3" rounded="md" bg="white" mb={4}>
          <Text fontSize="22" pl="3">Schüler</Text>
          <CardTable columns={columns} data={csvLines.sort()}
            before={() => (
              <Flex wrap="wrap" justify="flex-end" maxW="full" mb={4}>
                <Button onClick={() => {
                  csvLines.forEach(async student => {
                    if (student.isValid === true) {
                      const res = await create({
                        variables: {
                          createStudentData: {
                            firstName: student.firstName,
                            lastName: student.lastName
                          }
                        }
                      })
                      const errors = res.data.createStudent.errors
                      if (errors) {
                        errors.forEach(error => {
                          toast({
                            title: 'Fehler bei der Erstellung',
                            description: error.message == null ? error.code : `${error.code}: ${error.message}`,
                            status: 'error',
                            isClosable: true
                          })
                        })
                      } else if (res.data.createStudent.student) {
                        toast({
                          title: `Schüler ${res.data.createStudent.student.firstName} ${res.data.createStudent.student.lastName} hinzugefügt`,
                          description: `Der Schüler ${res.data.createStudent.student.firstName} ${res.data.createStudent.student.lastName} wurde erfolgreich erstellt`,
                          status: 'success',
                          isClosable: true
                        })
                      }
                    }
                  })
                }}>Nicht vorhandene Schüler importieren</Button>
              </Flex>
            )}
            sortableColumns={['firstName', 'lastName', 'isValid']}
            keyFn={(row) => row.original.id}
            rowFn={(row: Row<any>) => (
              <Flex w="full" transition="all" transitionDuration="200ms" boxShadow="sm" _hover={{ boxShadow: 'md' }} borderRadius="md" alignItems="center" px={4} py={2}>
                <Flex flexDirection="column">
                  <Text>{row.cells[0].render('Cell')} {row.cells[1].render('Cell')}</Text>
                </Flex>
                <Spacer />
                <Flex flexDirection="column">
                  {row.cells[2].value === false ? (<Tag mb={2} colorScheme="red" variant="solid">Schüler bereits vorhanden</Tag>) : (<Tag fontSize="sm" mb={2} colorScheme="green">Schüler noch nicht vorhanden</Tag>)}
                </Flex>
              </Flex>
            )}
          />
        </Box>
        )}
      </SimpleGrid>
    </PageScaffold>
  )
}

export default WithAuth(Studentsupload, { roles: [Role.Coordinator] })
