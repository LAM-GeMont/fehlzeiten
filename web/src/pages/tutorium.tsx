import { Center, Flex, Heading, SimpleGrid } from "@chakra-ui/layout";
import { Table, Thead, Tr, Th, Tbody, Td, Spinner, chakra } from "@chakra-ui/react";
import React, { FunctionComponent, useMemo } from "react";
import { PageScaffold } from "../components/PageScaffold"
import { useTutoriumsQuery } from "../generated/graphql";
import { useSortBy, useTable } from 'react-table'
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";

interface TableRow {
  name: string,
  id: string,
  createdAt: string
}

const TutoriumPage = () => {

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
        <Center minW="300px" minH="600px" margin={5}>
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
                {rows.map((row) => {
                  prepareRow(row)
                  return (
                    <Tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <Td {...cell.getCellProps()}>
                          {cell.render("Cell")}
                        </Td>
                      ))}
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          )}
        </Center>
      </SimpleGrid>
    </PageScaffold>
  )
}

export default TutoriumPage