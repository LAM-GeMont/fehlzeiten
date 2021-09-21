import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { chakra, shouldForwardProp, Table, Tbody, Td, Th, Thead } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import React from "react"
import { useSortBy, useTable } from "react-table";

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

const SortedTable: React.FC<SortedTableProps> = ({ columns, data }) => {

  const table = useTable({ columns, data, autoResetSortBy: false}, useSortBy)
  
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
          {rows.map((row) => {
            prepareRow(row)
            return (
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

  );
}

export default SortedTable;