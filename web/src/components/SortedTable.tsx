import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import { chakra, shouldForwardProp, Table, Tbody, Td, Th, Thead } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { Row, useGlobalFilter, useSortBy, useTable, TableInstance } from 'react-table'
import fuzzysort from 'fuzzysort'
import AwesomeDebouncePromise from 'awesome-debounce-promise'
import useConstant from 'use-constant'

const Tr = chakra(
  motion.tr,
  {
    shouldForwardProp: (prop) => {
      return true || shouldForwardProp(prop)
    }
  }
)

interface UseSortedTableProps {
  columns: any
  data: any
  initialFilter?: string
  filterKeys?: string[]
}

const filterFunction = function (this, rows: Row[], columnIds: string[], filterValue: string) {
  if (!filterValue) { return rows }
  const modifiedRows = rows.map(row => ({ originalRow: row, ...Object.fromEntries(Object.entries(row.values).filter(([, value]) => typeof value === 'string')) }))
  const res = fuzzysort.go(filterValue, modifiedRows, { keys: this.filterKeys != null ? this.filterKeys : columnIds, allowTypo: false })
  return res.map(result => result.obj.originalRow)
}

export const useSortedTable = ({ columns, data, initialFilter = '', filterKeys }: UseSortedTableProps) => {
  const [filter, setFilter] = useState(initialFilter)

  const table: TableInstance = useTable({
    columns,
    data,
    autoResetSortBy: false,
    autoResetGlobalFilter: true,
    globalFilter: filterFunction.bind({ filterKeys })
  }, useGlobalFilter, useSortBy)

  const debouncedSetTableFilter = useConstant(() => {
    return AwesomeDebouncePromise((f) => table.setGlobalFilter(f), 200)
  })

  return {
    tableProps: {
      table,
      tableFilter: table.state.globalFilter,
      columns,
      data,
      sort: table.state.sortBy
    },
    filter,
    setFilter: (f) => { setFilter(f); debouncedSetTableFilter(f) },
    filterKeys
  }
}

const SortedTable: React.FC<{table: TableInstance, tableFilter: string}> = ({ table, tableFilter }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = table

  useEffect(() => { table.setGlobalFilter(tableFilter) })

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

export default React.memo(SortedTable)
