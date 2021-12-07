import { CheckIcon, SearchIcon } from '@chakra-ui/icons'
import { Text, Box, Modal, ModalContent, ModalHeader, ModalOverlay, ModalCloseButton, ModalBody, ModalFooter, Button, Input, InputGroup, InputLeftElement, Flex, Spacer, Tag, TagCloseButton, TagLabel, InputRightElement, useDisclosure } from '@chakra-ui/react'
import React, { useCallback, useEffect, useState } from 'react'
import fuzzysort from 'fuzzysort'
import { AnimatePresence, motion } from 'framer-motion'

const MotionBox = motion(Box)

interface SearchSelectModalProps<T> {
    value: string[]
    items: T[]
    textTransformer: (t: T) => string
    valueTransformer: (t: T) => string
    selectMultiple?: boolean
    isOpen: boolean,
    onOpen: () => void,
    onClose: () => void,
    selection: string[],
    setSelection: ((f:(prevSelection: string[]) => string[]) => void)
    handleChange: (t: string[]) => void
}

export function useSearchSelectModal<T> (options: Pick<SearchSelectModalProps<T>, 'value' | 'items' | 'textTransformer' | 'selectMultiple' | 'handleChange' | 'valueTransformer'>) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selection, setSelection] = useState<string[]>(options.value)

  useEffect(() => {
    setSelection(options.value)
  }, [options.value])

  const { handleChange = () => {} } = options

  return {
    ...options,
    isOpen,
    onOpen,
    onClose,
    selection,
    setSelection: (f:(prevSelection: string[]) => string[]) => { setSelection((ids) => { const v = f(ids); handleChange(v); return v }) }
  }
}

function SearchSelectModal<T> ({ items = [], textTransformer, valueTransformer, selectMultiple, selection, setSelection, isOpen, onClose }: SearchSelectModalProps<T>): JSX.Element {
  const [search, setSearch] = useState('')
  const [tempSelection, setTempSelection] = useState<T[]>([])

  const objectByValue = useCallback((v: string) => items.find(item => valueTransformer(item) === v), [items, valueTransformer])

  useEffect(() => {
    setTempSelection(() => selection.map(value => objectByValue(value)))
  }, [selection])

  const handleSearchChange = event => setSearch(event.target.value)

  const saveChanges = () => {
    setSelection(() => tempSelection.map((v) => valueTransformer(v)))
    setSearch('')
  }

  const revertChanges = () => {
    setTempSelection(() => selection.map(value => objectByValue(value)))
    setSearch('')
  }

  const removeSelection = (t: T) => { setTempSelection(tempSelection => selectMultiple ? tempSelection.filter(v => v !== t) : []) }
  const select = (t: T) => setTempSelection(
    tempSelection => selectMultiple
      ? tempSelection.includes(t)
        ? tempSelection.filter(v => v !== t)
        : tempSelection.concat(t)
      : tempSelection.includes(t)
        ? []
        : [t])

  const searchables = items.map(t => ({ object: t, text: textTransformer(t) }))
  const results = fuzzysort.go(search, searchables, {
    key: 'text'
  })

  const itemsToDisplay = search.length === 0
    ? items
    : results.map(r => r.obj.object)

  return (
    <Modal isOpen={isOpen} onClose={() => { revertChanges(); onClose() }}>
      <motion.div transition={{}}/>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Auswahl</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <InputGroup marginBottom={2}>
            <InputLeftElement>
              <SearchIcon />
            </InputLeftElement>
            <Input value={search} onChange={handleSearchChange} variant="filled" />
            <InputRightElement>
              <TagCloseButton onClick={() => { setSearch('') }} />
            </InputRightElement>
          </InputGroup>
          {items.length === 0 &&
            <Flex h="md" padding={2} justifyContent="center">
              <Text mt={4}>Keine Elemente zur Auswahl verfügbar.</Text>
            </Flex>
          }
          {items.length !== 0 &&
            <Box h="md" overflowY="scroll" padding={2}>
              <Flex direction="column">
                <AnimatePresence initial={true}>
                  {itemsToDisplay.map((t) => (
                    <MotionBox
                      key={textTransformer(t)}
                      w="full"

                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.2,
                        ease: 'easeInOut'
                      }}
                    >
                      <Button isActive={tempSelection.includes(t)} onClick={
                        () => select(t)
                      }
                        variant="ghost" justifyContent="flex-start" my={0.5} w="full">
                        {textTransformer(t)}
                        <Spacer />
                        {tempSelection.includes(t) &&
                          <CheckIcon color="primary.400" mr={2} />
                        }
                      </Button>
                    </MotionBox>
                  ))}
                </ AnimatePresence>
              </Flex>
            </Box>
          }
        </ModalBody>
        <ModalFooter bg="gray.100" borderBottomRadius="md" flexDirection="column">
          <Flex wrap="wrap" alignSelf="flex-start" mb={2}>
            <Text w="full" mr={2}>
              {selectMultiple && (tempSelection.length === 0 ? '' : `Ausgewählt (${tempSelection.length}):`)}
              {!selectMultiple && (tempSelection.length === 0 ? '' : 'Ausgewählt:')}
            </Text>
            {tempSelection.map((t) => (
              <Tag key={textTransformer(t)} my={1} mr={1} colorScheme="primary">
                <TagLabel>{textTransformer(t)}</TagLabel>
                <TagCloseButton onClick={() => removeSelection(t)}/>
              </Tag>
            ))}
          </Flex>

          <Flex alignSelf="flex-end">
            <Button variant="ghost" colorScheme="gray" onClick={() => { revertChanges(); onClose() }}>Abbrechen</Button>
            <Button colorScheme="primary" onClick={() => { saveChanges(); onClose() }}>Auswählen</Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default SearchSelectModal
