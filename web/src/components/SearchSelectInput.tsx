import { FormControl, Input, FormLabel, FormErrorMessage, InputGroup, InputRightElement, Tag, Text } from '@chakra-ui/react'
import React from 'react'
import SearchSelectModal, { useSearchSelectModal } from './SearchSelectModal'
import { FieldHookConfig, useField } from 'formik'
import { ExternalLinkIcon } from '@chakra-ui/icons'

interface SearchSelectInputProps<T> {
  placeholder?: string
  items: T[]

  valueTransformer: (t: T) => string
  textTransformer: (t: T) => string

  name: string
  label: string
}

export function SearchSelectInputSingle<T> (props: SearchSelectInputProps<T> & FieldHookConfig<string>): JSX.Element {
  const { items, textTransformer, placeholder = 'Kein Objekt gewählt', valueTransformer, label, name } = props
  const [, meta, helpers] = useField(props)

  const objectByValue = (v: string) => items.find(item => valueTransformer(item) === v)

  const handleChange = (v: string[]) => {
    console.log(v)
    helpers.setValue(v.length === 0 ? '' : v[0])
  }

  const searchSelectModal = useSearchSelectModal<T>({
    value: meta.value != null && meta.value !== '' ? [meta.value] : [],
    items,
    textTransformer,
    valueTransformer,
    selectMultiple: false,
    handleChange
  })

  const activateModal = () => {
    searchSelectModal.onOpen()
    helpers.setTouched(true)
  }

  return (
    <>
      <FormControl id={name} isInvalid={meta.touched && meta.error != null}>
        <FormLabel>{label}</FormLabel>
        <InputGroup onFocus={activateModal} onClick={activateModal} >
          <Input isReadOnly value={searchSelectModal.selection.length === 0 ? '' : textTransformer(objectByValue(searchSelectModal.selection[0]))} placeholder={placeholder} />
          <InputRightElement>
            <ExternalLinkIcon />
          </InputRightElement>
        </InputGroup>
        <FormErrorMessage>{meta.error}</FormErrorMessage>
      </FormControl>
      <SearchSelectModal {...searchSelectModal} />
    </>
  )
}

export function SearchSelectInputMultiple<T> (props: SearchSelectInputProps<T> & FieldHookConfig<Array<String>>): JSX.Element {
  const { items, textTransformer, valueTransformer, placeholder = 'Keine Objekt gewählt', label, name } = props
  const [, meta, helpers] = useField(props)

  const objectByValue = (v: string) => items.find(item => valueTransformer(item) === v)

  const handleChange = (v: string[]) => {
    console.log(v)
    helpers.setValue(v)
  }

  const searchSelectModal = useSearchSelectModal<T>({
    value: meta.value != null && Array.isArray(meta.value) ? meta.value as string[] : [],
    items,
    textTransformer,
    valueTransformer,
    selectMultiple: true,
    handleChange
  })

  const activateModal = () => {
    searchSelectModal.onOpen()
    helpers.setTouched(true)
  }

  return (
    <>
      <FormControl id={name} isInvalid={meta.touched && meta.error != null}>
        <FormLabel>{label}</FormLabel>
        <InputGroup onFocus={(e) => { activateModal(); e.target.blur() }} onClick={activateModal} >
          <Input as="div" w="xs" h="auto" minH={20} p={2}>
            {searchSelectModal.selection.length === 0 &&
              <Text color="gray">{placeholder}</Text>
            }
            {searchSelectModal.selection.map(objectByValue).map(textTransformer).map(text => (
              <Tag key={text} m={1}>{text}</Tag>
            ))}

          </Input>
          <InputRightElement>
            <ExternalLinkIcon />
          </InputRightElement>
        </InputGroup>
        <FormErrorMessage>{meta.error}</FormErrorMessage>
      </FormControl>
      <SearchSelectModal {...searchSelectModal} />
    </>
  )
}
