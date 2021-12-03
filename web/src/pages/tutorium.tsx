import { Flex, Heading, SimpleGrid } from '@chakra-ui/layout'
import { Button, IconButton, useDisclosure, useToast, Text, Box, Input, InputGroup, InputLeftElement, Link } from '@chakra-ui/react'
import React, { useCallback, useMemo, useState } from 'react'
import { PageScaffold } from '../components/PageScaffold'
import { useTutoriumsQuery } from '../generated/graphql'
import { AddIcon, Icon, DeleteIcon, RepeatIcon, SearchIcon } from '@chakra-ui/icons'
import { FaEdit, FaUser } from 'react-icons/fa'
import { CreateTutoriumModal } from '../components/CreateTutoriumModal'
import { toastApolloError } from '../util'
import WithAuth, { WithAuthProps } from '../components/withAuth'
import { DeleteTutoriumAlertDialog } from '../components/DeleteTutoriumAlertDialog'
import { EditTutoriumModal } from '../components/EditTutoriumModal'
import { useAsyncDebounce, Row } from 'react-table'
import { CardTable } from '../components/BetterTable'
import NextLink from 'next/link'

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
      accessor: 'name' as keyof TableRow,
      Cell: ({ row }) => (
        <Link href={`/tutorium/${row.original.id}`}>
          <Text>{`${row.original.name}`}</Text>
        </Link>
      )
    },
    {
      Header: 'Tutorname',
      accessor: 'tutor.name' as keyof TableRow
    },
    {
      Header: 'Aktionen',
      Cell: ({ row }) => (
        <Flex justifyContent="center">
          <IconButton isDisabled={self.role === 'TEACHER'} variant="outline" aria-label="Bearbeiten" icon={<FaEdit />} onClick={ () => editTutorium(row)} mr={2} />
          <IconButton isDisabled={self.role === 'TEACHER'} variant="outline" aria-label="Löschen" icon={<DeleteIcon />} onClick={ () => deleteTutorium(row)} />
        </Flex>
      )
    }
  ], [deleteTutorium, editTutorium, self.role])

  const setFilter = useAsyncDebounce((filter, set) => set(filter), 200)

  return (
    <PageScaffold role={self.role}>
      <Heading as="h1" size="xl" mb={3}>Tutorien</Heading>
      <SimpleGrid>
        <Flex direction="column" alignItems="center">
          {tutoriumsQuery.error != null && (<Heading>Error!</Heading>)}
          {tutoriumsQuery.data != null && (
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
                    <Button mr={2} flexGrow={2} leftIcon={<AddIcon />} onClick={tutoriumCreateModal.onOpen}>Tutorium hinzufügen</Button>
                    <IconButton variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon/>} onClick={() => {
                      tutoriumsQuery.refetch()
                    }}/>
                  </Flex>
                </Flex>
              )}

              sortableColumns={['name', 'tutor.name']}

              keyFn={(row) => row.original.id}

              rowFn={(row: Row<any>) => (
                <Flex w="full" transition="all" transitionDuration="200ms" boxShadow="sm" _hover={{ boxShadow: 'md' }} borderRadius="md" alignItems="center" px={4} py={2}>
                  <NextLink href={`/tutorium/${row.original.id}`}><span style={{ flexGrow: 10, fontWeight: 600 }}>{row.cells[0].render('Cell')}{' '}</span></NextLink>
                  {row.original.tutor != null && <Text mx={4} flexGrow={10} textAlign="right"><Icon as={FaUser} mr={2} mb={1} />{row.cells[1].render('Cell')}</Text>}
                  {row.cells[2].render('Cell')}
                </Flex>
              )}
            />
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
      <EditTutoriumModal isOpen={tutoriumEditAlertDialog.isOpen} onClose={tutoriumEditAlertDialog.onClose} tutoriumId={rowId} name={rowName} teacherId={rowtutorId} />
    </PageScaffold>
  )
}

export default WithAuth(TutoriumPage)
