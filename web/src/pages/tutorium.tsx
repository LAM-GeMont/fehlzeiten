import { Flex, Heading, SimpleGrid } from '@chakra-ui/layout'
import { Spinner, Button, IconButton, useDisclosure, useToast, Text, Box, Input, InputGroup, InputLeftElement } from '@chakra-ui/react'
import React, { useCallback, useMemo, useState } from 'react'
import { PageScaffold } from '../components/PageScaffold'
import { Role, useTutoriumsQuery } from '../generated/graphql'
import { AddIcon, DeleteIcon, RepeatIcon, SearchIcon } from '@chakra-ui/icons'
import { FaEdit } from 'react-icons/fa'
import { CreateTutoriumModal } from '../components/CreateTutoriumModal'
import SortedTable, { useSortedTable } from '../components/SortedTable'
import { toastApolloError } from '../util'
import WithAuth, { WithAuthProps } from '../components/withAuth'
import { DeleteTutoriumAlertDialog } from '../components/DeleteTutoriumAlertDialog'
import { EditTutoriumAlertDialog } from '../components/EditTutoriumAlertDialog'

interface TableRow {
  name: string,
  id: string,
  createdAt: string
}

interface Props extends WithAuthProps {}

const TutoriumPage: React.FC<Props> = ({ self }) => {
  const tutoriumCreateModal = useDisclosure()
  const tutoriumEditAlertDialog = useDisclosure()
  const tutoriumDeleteAlertDialog = useDisclosure()
  const toast = useToast()
  const [rowId, setRowId] = useState('')
  const [rowName, setRowName] = useState('')
  const [rowtutorId, setRowTutorId] = useState('')

  const tutoriumsQuery = useTutoriumsQuery({
    onError: errors => toastApolloError(toast, errors)
  })

  const openEdit = tutoriumEditAlertDialog.onOpen
  const editTutorium = useCallback((row) => {
    setRowId(row.original.id)
    setRowName(row.original.name)
    row.original.tutor ? setRowTutorId(row.original.tutor.id) : setRowTutorId('')
    openEdit()
  }, [openEdit])

  const openDelete = tutoriumDeleteAlertDialog.onOpen
  const deleteTutorium = useCallback((row) => {
    setRowId(row.original.id)
    setRowName(row.original.name)
    openDelete()
  }, [openDelete])

  const data = useMemo(() => {
    if (tutoriumsQuery.data?.tutoriums != null) {
      return tutoriumsQuery.data.tutoriums
    } else {
      return []
    }
  }, [tutoriumsQuery.data])

  const columns = useMemo(() => [
    {
      Header: 'Kursname',
      accessor: 'name' as keyof TableRow
    },
    {
      Header: 'Tutorname',
      accessor: 'tutor.name' as keyof TableRow
    },
    {
      Header: 'ID',
      accessor: 'id' as keyof TableRow
    },
    {
      Header: 'Erstellt am',
      accessor: 'createdAt' as keyof TableRow,
      Cell: ({ value }) => new Date(value).toLocaleDateString()
    },
    {
      Header: 'Aktionen',
      Cell: ({ row }) => (
        <Flex justifyContent="center">
          <IconButton isDisabled={self.role === 'TEACHER'} variant="outline" aria-label="Bearbeiten" icon={<FaEdit />} onClick={ () => editTutorium(row)} />
          <Box mr={2}></Box>
          <IconButton isDisabled={self.role === 'TEACHER'} variant="outline" aria-label="Löschen" icon={<DeleteIcon />} onClick={ () => deleteTutorium(row)} />
        </Flex>
      )
    }
  ], [deleteTutorium, editTutorium, self.role])

  const sortedTable = useSortedTable({
    columns,
    data,
    filterKeys: ['name', 'tutor.name']
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
            <Button marginLeft="auto" leftIcon={<AddIcon />} onClick={tutoriumCreateModal.onOpen}>Tutorium hinzufügen</Button>
            <IconButton ml={4} variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon />} onClick={() => { tutoriumsQuery.refetch() }}></IconButton>
          </Flex>
          {tutoriumsQuery.loading && (<Spinner />)}
          {tutoriumsQuery.error != null && (<Heading>Error!</Heading>)}
          {tutoriumsQuery.data != null && (
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
      <CreateTutoriumModal isOpen={tutoriumCreateModal.isOpen} onClose={tutoriumCreateModal.onClose} />
      <DeleteTutoriumAlertDialog isOpen={tutoriumDeleteAlertDialog.isOpen} onClose={tutoriumDeleteAlertDialog.onClose} rowId={rowId} name={rowName} />
      <EditTutoriumAlertDialog isOpen={tutoriumEditAlertDialog.isOpen} onClose={tutoriumEditAlertDialog.onClose} tutoriumId={rowId} name={rowName} teacherId={rowtutorId} />
    </PageScaffold>
  )
}

export default WithAuth(TutoriumPage, { roles: [Role.Coordinator] })
