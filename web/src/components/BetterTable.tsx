import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import { Table, Thead, Th, Tbody, Td, TableProps, TableBodyProps, Tr, Box, Stack, chakra, Flex, BoxProps, StackProps, Select, Text } from '@chakra-ui/react'
import { AnimatePresence, HTMLMotionProps, motion } from 'framer-motion'
import fuzzysort from 'fuzzysort'
import React, { MouseEventHandler, useCallback } from 'react'
import { HeaderGroup, Row, TableInstance, TableOptions, useGlobalFilter, useSortBy, useTable } from 'react-table'

const MotionTr = motion(Tr)
const MotionBox = motion(Box)

const filterFunction = function (this, rows: Row[], columnIds: string[], filterValue: string) {
  if (!filterValue) { return rows }
  const modifiedRows = rows.map(row => ({ originalRow: row, ...Object.fromEntries(Object.entries(row.values).filter(([, value]) => typeof value === 'string')) }))
  const res = fuzzysort.go(filterValue, modifiedRows, { keys: this.filterKeys != null ? this.filterKeys : columnIds, allowTypo: false })
  return res.map(result => result.obj.originalRow)
}

export const SortIcon: React.FC<{ sorted: boolean, descending: boolean, onClick?: MouseEventHandler, pl?: number }> = ({ sorted, descending, onClick, pl = 4 }) => {
  return (
    <chakra.span pl={pl} onClick={onClick} >
      {sorted && descending &&
        <TriangleDownIcon aria-label="sorted descending" />
      }
      {sorted && !descending &&
        <TriangleUpIcon aria-label="sorted ascending" />
      }
    </chakra.span>
  )
}

type HeadFn<T extends object> = (headerGroups: HeaderGroup<T>[], table: TableInstance<T>) => JSX.Element

function DefaultHeadFn<T extends object> (headerGroups: HeaderGroup<T>[]) {
  return (
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
              <SortIcon sorted={column.isSorted} descending={column.isSortedDesc} />
            </Th>
          ))}
        </Tr>
      ))}
    </Thead>
  )
}

const defaultRowAnimationProps = {
  initial: {
    opacity: 0,
    y: 100
  },
  animate: {
    opacity: 1,
    y: 0
  },
  transition: {
    ease: 'easeOut'
  },
  layout: 'position'
}

type RowFn<T extends object> = (row: Row<T>, table: TableInstance<T>) => JSX.Element

function DefaultRowFn<T extends object> (row: Row<T>) {
  return row.cells.map((cell) => (
    // eslint-disable-next-line react/jsx-key
    <Td {...cell.getCellProps()}>
      {cell.render('Cell')}
    </Td>
  ))
}

type BeforeFn<T extends object> = (table: TableInstance<T>) => JSX.Element

interface BetterTableProps {
  tableProps?: TableProps
  tableBodyProps?: TableBodyProps
  headFn?: HeadFn<object>
  rowAnimationProps?: HTMLMotionProps<'tr'>
  rowFn?: RowFn<object>
  before?: BeforeFn<object>
  filterKeys: string[]
}

export function BetterTable (props: React.PropsWithChildren<BetterTableProps & TableOptions<object>>) {
  const {
    columns,
    data,
    tableProps = {},
    tableBodyProps = {},
    headFn = DefaultHeadFn,
    rowAnimationProps = defaultRowAnimationProps,
    rowFn = DefaultRowFn,
    before: Before = () => null,
    filterKeys
  } = props

  const table = useTable({
    columns,
    data,
    autoResetGlobalFilter: false,
    globalFilter: filterFunction.bind({ filterKeys })
  }, useGlobalFilter, useSortBy)

  return (
    <>
      {Before(table)}
      <Table {...table.getTableProps()} {...tableProps}>
        {headFn(table.headerGroups, table)}
        <Tbody {...table.getTableBodyProps()} {...tableBodyProps}>
          <AnimatePresence initial={false}>
            {table.rows.map((row) => {
              table.prepareRow(row)
              return (
                // eslint-disable-next-line react/jsx-key
                <MotionTr {...row.getRowProps()} {...rowAnimationProps}>
                  {rowFn(row, table)}
                </MotionTr>
              )
            })}
          </AnimatePresence>
        </Tbody>
      </Table>
    </>
  )
}

function CardRowFn<T extends object> (row: Row<T>) {
  return (
    <Box w="full" boxShadow="md" p={4}>
      {row.cells.map((cell) => (
        // eslint-disable-next-line react/jsx-key
        <Box {...cell.getCellProps()}>
          {cell.render('Cell')}
        </Box>
      ))}
    </Box>
  )
}

interface CardTableProps {
  tableProps?: BoxProps
  tableBodyProps?: StackProps
  rowAnimationProps?: HTMLMotionProps<'div'>
  rowFn: RowFn<object>
  before?: BeforeFn<object>
  keyFn?: (row) => string
  sortableColumns?: string[]
  filterKeys?: string[]
}

export function CardTable (props: React.PropsWithChildren<CardTableProps & TableOptions<object>>) {
  const {
    columns,
    data,
    tableProps = {},
    tableBodyProps = {},
    rowAnimationProps = defaultRowAnimationProps,
    rowFn = CardRowFn,
    before: Before = () => null,
    keyFn = () => undefined,
    sortableColumns = [],
    filterKeys
  } = props

  const table = useTable({
    columns,
    data,
    autoResetGlobalFilter: false,
    autoResetSortBy: false,
    initialState: { sortBy: [{ id: sortableColumns.length > 0 ? sortableColumns[0] : '', desc: false }] },
    globalFilter: filterFunction.bind({ filterKeys })
  }, useGlobalFilter, useSortBy)

  const sortBy = table.state.sortBy[0]

  const invertSortOrder = useCallback(() => {
    table.setSortBy([{ ...sortBy, desc: !sortBy.desc }])
  }, [sortBy, table])

  return (
    <>
      {Before(table)}
      {sortableColumns.length > 0 &&
        <Flex w="full" justify="flex-end">
          <Text mr={2} fontWeight="semibold">Sortierung:</Text>
          <Flex onClick={invertSortOrder}>
            <Text mr={2}>
              {sortBy.desc ? 'Absteigend' : 'Aufsteigend'}
            </Text>
            <SortIcon sorted descending={sortBy.desc} pl={0} />
          </Flex>
          <Select ml={4} size="xs" flexBasis="content" flexGrow={0} value={sortBy.id} onChange={e => table.setSortBy([{ id: e.target.value, desc: sortBy.desc }])}>
            {sortableColumns.map(column => (
              <option key={column} value={column}>{columns.filter(c => c.accessor === column).map(c => c.Header)[0]}</option>
            ))}
          </Select>
        </Flex>
      }
      <Box {...table.getTableProps()} w="full" {...tableProps}>
        <Stack {...table.getTableBodyProps()} spacing={2} {...tableBodyProps}>
          <AnimatePresence initial={false}>
            {table.rows.map((row) => {
              table.prepareRow(row)
              return (
                // eslint-disable-next-line react/jsx-key
                <MotionBox key={keyFn(row)} {...row.getRowProps()} {...rowAnimationProps}>
                  {rowFn(row, table)}
                </MotionBox>
              )
            })}
          </AnimatePresence>
        </Stack>
      </Box>
    </>
  )
}
