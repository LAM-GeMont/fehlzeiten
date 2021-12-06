import { Flex, Heading, SimpleGrid } from '@chakra-ui/layout'
import { Spinner, Button, IconButton, useDisclosure, useToast, Text, Box, Input, InputGroup, InputLeftElement } from '@chakra-ui/react'
import React, { useCallback, useMemo, useState } from 'react'
import { PageScaffold } from '../components/PageScaffold'
import { Role, useSemestersQuery } from '../generated/graphql'
import { AddIcon, CalendarIcon, DeleteIcon, RepeatIcon, SearchIcon } from '@chakra-ui/icons'
import { CardTable } from '../components/BetterTable'
import { toastApolloError } from '../util'
import WithAuth, { WithAuthProps } from '../components/withAuth'
import { CreateSemesterModal } from '../components/CreateSemesterModal'
import { DeleteSemesterAlertDialog } from '../components/DeleteSemesterAlertDialog'
import { Row, useAsyncDebounce } from 'react-table'

interface TableRow {
  name: string,
  id: string,
  createdAt: string
}

interface Props extends WithAuthProps {}

const SemesterPage: React.FC<Props> = ({ self }) => {
  const semesterCreateModal = useDisclosure()
  const semesterDeleteAlertDialog = useDisclosure()
  const toast = useToast()
  const [rowId, setRowId] = useState('')
  const [rowName, setRowName] = useState('')

  const semestersQuery = useSemestersQuery({
    onError: errors => toastApolloError(toast, errors),
    pollInterval: 60000
  })

  const openDelete = semesterDeleteAlertDialog.onOpen
  const deleteSemester = useCallback((row) => {
    setRowId(row.original.id)
    setRowName(row.original.name)
    openDelete()
  }, [openDelete])

  const data = useMemo(() => {
    if (semestersQuery.data?.semesters != null) {
      return semestersQuery.data.semesters
    } else {
      return []
    }
  }, [semestersQuery.data])

  const columns = useMemo(() => [
    {
      Header: 'Name',
      accessor: 'name' as keyof TableRow
    },
    {
      Header: 'Start',
      accessor: 'startDate' as keyof TableRow,
      Cell: ({ value }) => new Date(value).toLocaleDateString()
    },
    {
      Header: 'Ende',
      accessor: 'endDate' as keyof TableRow,
      Cell: ({ value }) => new Date(value).toLocaleDateString()
    },
    {
      Header: 'Aktionen',
      Cell: ({ row }) => (
        <Flex justifyContent="center">
          <IconButton variant="outline" aria-label="Löschen" icon={<DeleteIcon />} onClick={ () => deleteSemester(row)} />
        </Flex>
      )
    }
  ], [deleteSemester])

  const setFilter = useAsyncDebounce((filter, set) => set(filter), 200)

  return (
    <PageScaffold role={self.role}>
      <Heading as="h1" size="xl" mb={3}>Zeitspannen</Heading>
      <SimpleGrid>
        <Flex direction="column" alignItems="center">
          {semestersQuery.loading && (<Spinner />)}
          {semestersQuery.error != null && (<Heading>Error!</Heading>)}
          {semestersQuery.data != null && (
            <CardTable data={data} columns={columns}
              before={(table) => (
                <Flex wrap="wrap" justify="flex-end" w="100%" mb={4}>
                  <InputGroup flexShrink={10} w="full" maxW="full" mb={2}>
                    <InputLeftElement>
                      <SearchIcon />
                    </InputLeftElement>
                    <Input width="full" value={undefined} onChange={e => setFilter(e.target.value, table.setGlobalFilter)} />
                  </InputGroup>
                  <Flex flexGrow={2}>
                    <Button mr={2} flexGrow={2} leftIcon={<AddIcon />} onClick={semesterCreateModal.onOpen}>Zeitspanne hinzufügen</Button>
                    <IconButton variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon/>} onClick={() => {
                      semestersQuery.refetch()
                    }}/>
                  </Flex>
                </Flex>
              )}

              sortableColumns={['name', 'startDate', 'endDate']}

              keyFn={(row) => row.original.id}

              rowFn={(row: Row<any>) => (
                <Flex w="full" transition="all" transitionDuration="200ms" boxShadow="sm" _hover={{ boxShadow: 'md' }} borderRadius="md" alignItems="center" px={4} py={2}>
                  <Text fontWeight="semibold">{row.cells[0].render('Cell')}{' '}</Text>
                  <Text mx={4} flexGrow={10} textAlign="right"><CalendarIcon mr={2} mb={1} />{row.cells[1].render('Cell')} - {row.cells[2].render('Cell')}</Text>
                  {row.cells[3].render('Cell')}
                </Flex>
              )}
            />
          )}
          {(data.length === 0) && (
            <Box mt={5}>
              <Text>Es wurden noch keine Zeitspannen erstellt.</Text>
            </Box>
          )}
        </Flex>
      </SimpleGrid>
      <CreateSemesterModal isOpen={semesterCreateModal.isOpen} onClose={semesterCreateModal.onClose} />
      <DeleteSemesterAlertDialog isOpen={semesterDeleteAlertDialog.isOpen} onClose={semesterDeleteAlertDialog.onClose} semesterId={rowId} name={rowName} />
    </PageScaffold>
  )
}

export default WithAuth(SemesterPage, { roles: [Role.Coordinator] })
