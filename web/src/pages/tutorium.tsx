import { Center, Divider, Flex, Heading, SimpleGrid } from "@chakra-ui/layout";
import { Table, Thead, Th, Tbody, Td, Spinner, chakra, Button, IconButton, Modal, ModalContent, ModalOverlay, useDisclosure, ModalHeader, ModalBody, ModalCloseButton, ModalFooter, shouldForwardProp } from "@chakra-ui/react";
import React, { FunctionComponent, useMemo } from "react";
import { PageScaffold } from "../components/PageScaffold"
import { useTutoriumsQuery } from "../generated/graphql";
import { useSortBy, useTable } from 'react-table'
import { AddIcon, RepeatIcon, TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { CreateTutoriumModal } from "../components/CreateTutoriumModal";
import { AnimatePresence, motion } from "framer-motion";

interface TableRow {
  name: string,
  id: string,
  createdAt: string
}

const Tr = chakra(motion.tr,
  {
    shouldForwardProp: (prop) => {
      return true || shouldForwardProp(prop)
    }
  })

const TutoriumPage = () => {

  const tutoriumCreateModal = useDisclosure()

  const res = useTutoriumsQuery()

  const data = useMemo(() => {

    if (res.data?.tutoriums != null) {
      return res.data.tutoriums.map(tutorium => {
        return {
          ...tutorium,
          createdAt: new Date(tutorium.createdAt).toLocaleDateString()
        }
      })
    } else {
      return []
    }
  }, [res.data])

  const columns = useMemo(() => [
    {
      Header: 'Name',
      accessor: 'name' as keyof TableRow
    },
    {
      Header: "ID",
      accessor: "id" as keyof TableRow
    },
    {
      Header: "Erstellt am",
      accessor: "createdAt" as keyof TableRow
    }
  ], [])

  const table = useTable({ columns, data}, useSortBy)

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = table

  return (
    <PageScaffold>
      <SimpleGrid>
        <Flex direction="column" alignItems="center" minW="300px" minH="600px" margin={5}>
          <Flex w="full" padding={5}>
            <Button marginLeft="auto" leftIcon={<AddIcon />} onClick={tutoriumCreateModal.onOpen}>Tutorium hinzufügen</Button>
            <IconButton ml={4} variant="outline" aria-label="Daten neu laden" icon={<RepeatIcon />} onClick={() => {res.refetch()}}>Tutorium hinzufügen</IconButton>
          </Flex>
          {res.loading && (<Spinner />)}
          {res.error != null && (<Heading>Error!</Heading>)}
          {res.error == null && !res.loading && (
            <Table {...getTableProps()}>
              <Thead>
                {headerGroups.map((headerGroup) => (
                  <Tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <Th
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                      >
                        {column.render("Header")}
                        <chakra.span pl="4">
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <TriangleDownIcon aria-label="sorted descending" />
                            ) : (
                              <TriangleUpIcon aria-label="sorted ascending" />
                            )
                          ) : null}
                        </chakra.span>
                      </Th>
                    ))}
                  </Tr>
                ))}
              </Thead>
              <Tbody {...getTableBodyProps()}>
                <AnimatePresence initial={false}>
                  {rows.map((row, i) => {
                    prepareRow(row)
                    return (
                      <Tr key={i} as={motion.tr} {...row.getRowProps()}
                        initial={{
                          opacity: 0,
                          y: 100
                        }}
                        animate={{
                          opacity: 1,
                          y: 0
                        }}
                        transition={{
                          ease: "easeOut"
                        }}
                      >
                        {row.cells.map((cell) => (
                          <Td {...cell.getCellProps()}>
                            {cell.render("Cell")}
                          </Td>
                        ))}
                      </Tr>
                    )
                  })}
                </AnimatePresence>
              </Tbody>
            </Table>
          )}
        </Flex>
      </SimpleGrid>
      <CreateTutoriumModal isOpen={tutoriumCreateModal.isOpen} onClose={tutoriumCreateModal.onClose} onCreate={res.refetch} />
    </PageScaffold>
  )
}

export default TutoriumPage