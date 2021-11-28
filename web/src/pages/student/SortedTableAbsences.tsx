import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import { Box, chakra, shouldForwardProp, Table, Tbody, Td, Th, Thead } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { useSortBy, useTable } from 'react-table'

interface SortedTableProps {
  columns: any,
  data: any
}

const Tr = chakra(
  motion.tr,
  {
    shouldForwardProp: (prop) => {
      return true || shouldForwardProp(prop)
    }
  }
)

function checkIfExam(props: any) {
  if (typeof props == "boolean" && props) {
      return (
        <Box borderRadius="md" bg="blue.400" color="white" w='full' p={3} pt={1} h={8} textAlign="center">
          Klausur
        </Box>
      )
  }
}

const SortedTable: React.FC<SortedTableProps> = ({ columns, data }) => {
  const table = useTable({ columns, data, autoResetSortBy: false }, useSortBy)

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = table

  return (
    <Table {...getTableProps()}>
      <Thead>
        {headerGroups.map((headerGroup) => (
          // eslint-disable-next-line react/jsx-key
          <Tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              // eslint-disable-next-line react/jsx-key
              <Th
                {...column.getHeaderProps(column.getSortByToggleProps())}
              >
                {column.render('Header')}
                <chakra.span pl="4">
                  {column.isSorted
                    ? (
                        column.isSortedDesc
                          ? (
                      <TriangleDownIcon aria-label="sorted descending" />
                            )
                          : (
                      <TriangleUpIcon aria-label="sorted ascending" />
                            )
                      )
                    : null}
                </chakra.span>
              </Th>
            ))}
          </Tr>
        ))}
      </Thead>
      <Tbody {...getTableBodyProps()}>
        <AnimatePresence initial={false}>
          {rows.map((row) => {
            prepareRow(row)
            return (
              // eslint-disable-next-line react/jsx-key
              <Tr {...row.getRowProps()}
                initial={{
                  opacity: 0,
                  y: 100
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  ease: 'easeOut'
                }}
              >
                {row.cells.map((cell) => (
                  // eslint-disable-next-line react/jsx-key
                  <Td {...cell.getCellProps()}>
                    {checkIfExam(cell.value)}
                    {cell.render('Cell')}
                  </Td>
                ))}
              </Tr>
            )
          })}
        </AnimatePresence>
      </Tbody>
    </Table>

  )
}

export default SortedTable
