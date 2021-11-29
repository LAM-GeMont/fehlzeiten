import { Flex, Heading, SimpleGrid } from '@chakra-ui/layout'
import { Spinner, Button, IconButton, useDisclosure, useToast, Text, Box, Input, InputGroup, InputLeftElement } from '@chakra-ui/react'
import React, { useCallback, useMemo, useState } from 'react'
import { PageScaffold } from '../components/PageScaffold'
import { Role, useSemestersQuery } from '../generated/graphql'
import { AddIcon, DeleteIcon, RepeatIcon, SearchIcon } from '@chakra-ui/icons'
import SortedTable, { useSortedTable } from '../components/SortedTable'
import { toastApolloError } from '../util'
import WithAuth, { WithAuthProps } from '../components/withAuth'
import { DeleteTutoriumAlertDialog } from '../components/DeleteTutoriumAlertDialog'
import { CreateSemesterModal } from '../components/CreateSemesterModal'

interface TableRow {
  name: string,
  id: string,
  createdAt: string
}

interface Props extends WithAuthProps {}

const TutoriumPage: React.FC<Props> = ({ self }) => {
  const semesterCreateModal = useDisclosure()
  const tutoriumDeleteAlertDialog = useDisclosure()
  const toast = useToast()
  const [rowId, setRowId] = useState('')
  const [rowName, setRowName] = useState('')

  const semestersQuery = useSemestersQuery({
    onError: errors => toastApolloError(toast, errors)
  })

  const openDelete = tutoriumDeleteAlertDialog.onOpen
  const deleteTutorium = useCallback((row) => {
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
      accessor: 'startDate' as keyof TableRow
    },
    {
      Header: 'Ende',
      accessor: 'endDate' as keyof TableRow
    },
    {
      Header: 'Aktionen',
      Cell: ({ row }) => (
        <Flex justifyContent="center">
          <IconButton variant="outline" aria-label="Löschen" icon={<DeleteIcon />} onClick={ () => deleteTutorium(row)} />
        </Flex>
      )
    }
  ], [deleteTutorium, self.role])

  const sortedTable = useSortedTable({
    columns,
    data,
    filterKeys: ['name', 'startDate', 'endDate']
  })

  return (
    <PageScaffold role={self.role}>
      <SimpleGrid>
        <Flex direction="column" alignItems="center" minW="300px" minH="600px" margin={5}>
          <Flex w="full" padding={5}>
            <InputGroup flexShrink={10}>
              <InputLeftElement>
                <SearchIcon />
              </InputLeftElement>
              <Input width="xs" value={sortedTable.filter} onChange={e => sortedTable.setFilter(e.target.value)} />
            </InputGroup>
            <Button marginLeft="auto" leftIcon={<AddIcon />} onClick={semesterCreateModal.onOpen}>Zeitspanne hinzufügen</Button>
            <IconButton ml={4} variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon />} onClick={() => { semestersQuery.refetch() }}></IconButton>
          </Flex>
          {semestersQuery.loading && (<Spinner />)}
          {semestersQuery.error != null && (<Heading>Error!</Heading>)}
          {semestersQuery.data != null && (
            <SortedTable table={sortedTable.table} tableFilter={sortedTable.tableFilter}/>
          )}
          {(data.length === 0) && (
            <Box mt={5}>
              {(self.role === 'COORDINATOR' && (
                <Text>Es wurden noch keine Tutorien erstellt.</Text>
              ))}
              {(self.role === 'TEACHER' && (
                <Text>Ihnen sind noch keine Tutorien zugewiesen.</Text>
              ))}
            </Box>
          )}
        </Flex>
      </SimpleGrid>
      <CreateSemesterModal isOpen={semesterCreateModal.isOpen} onClose={semesterCreateModal.onClose} />
      <DeleteTutoriumAlertDialog isOpen={tutoriumDeleteAlertDialog.isOpen} onClose={tutoriumDeleteAlertDialog.onClose} rowId={rowId} name={rowName} />
    </PageScaffold>
  )
}

export default WithAuth(TutoriumPage, { roles: [Role.Coordinator] })
