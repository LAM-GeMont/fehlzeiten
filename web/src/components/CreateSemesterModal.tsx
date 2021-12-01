import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage
} from '@chakra-ui/react'
import { Field, Form, Formik } from 'formik'
import { SemesterCreateErrorCode, useCreateSemesterMutation } from '../generated/graphql'
import { formatDateISO, handleStartEndDateChange, toastApolloError } from '../util'

import React from 'react'

interface Props {
  isOpen: boolean,
  onClose: () => void,
}

const validateName = (value: string) => {
  let error
  if (!value || value.length < 1) {
    error = 'Ein Name muss festgelegt werden.'
  }
  return error
}

export const CreateSemesterModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const toast = useToast()
  const [create] = useCreateSemesterMutation({
    onError: errors => toastApolloError(toast, errors)
  })
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth()
  const initialStartDate = formatDateISO(new Date(year, month, 1))
  const initialEndDate = formatDateISO(new Date(year, month + 6, 0))

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>
      <ModalContent>
        <Formik
          initialValues={{
            name: '',
            startDate: initialStartDate,
            endDate: initialEndDate
          }}
          onSubmit={async (values, actions) => {
            const res = await create({
              variables: { data: values },
              refetchQueries: 'active'
            })
            if (res.data) {
              if (res.data.createSemester.errors) {
                res.data.createSemester.errors.forEach(error => {
                  if (error.code === SemesterCreateErrorCode.DuplicateName) {
                    actions.setFieldError('name', 'Diese Zeitspanne gibt es bereits. Bitte wählen Sie einen anderen Namen')
                  } else {
                    toast({
                      title: 'Fehler bei der Erstellung',
                      description: error.message == null ? error.code : `${error.code}: ${error.message}`,
                      status: 'error',
                      isClosable: true
                    })
                  }
                })
              }
              if (res.data.createSemester.semester) {
                toast({
                  title: 'Zeitspanne erfolgreich erstellt',
                  status: 'success',
                  isClosable: true
                })
                onClose()
              }
            }
          }}
        >
          {(props) => (
            <Form>
              <ModalHeader>Zeitspanne erstellen</ModalHeader>
              <ModalCloseButton/>
              <ModalBody>
                <Field name="name" validate={validateName}>
                  {({ field, form }) => (
                    <FormControl isRequired isInvalid={form.errors.name && form.touched.name} mb={6}>
                      <FormLabel htmlFor="name">Name der Zeitspanne</FormLabel>
                      <Input {...field} id="name" placeholder="Name" autoFocus={true}/>
                      <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="startDate">
                  {({ field, form }) => (
                    <FormControl isRequired isInvalid={form.errors.startDate && form.touched.startDate} mb={6}>
                      <FormLabel htmlFor="startDate">Startdatum</FormLabel>
                      <Input
                        {...field}
                        id="startDate"
                        type="date"
                        max={form.values.endDate}
                        onBlur={e => handleStartEndDateChange(e, field, form)}
                        onChange={e => handleStartEndDateChange(e, field, form)}
                      />
                      <FormErrorMessage>{form.errors.startDate}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="endDate">
                  {({ field, form }) => (
                    <FormControl isRequired isInvalid={form.errors.endDate && form.touched.endDate}>
                      <FormLabel htmlFor="endDate">Enddatum</FormLabel>
                      <Input
                        {...field}
                        id="endDate"
                        type="date"
                        min={form.values.startDate}
                        onBlur={e => handleStartEndDateChange(e, field, form)}
                        onChange={e => handleStartEndDateChange(e, field, form)}
                      />
                      <FormErrorMessage>{form.errors.endDate}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </ModalBody>
              <ModalFooter>
                <Button mr={3} variant="ghost" onClick={onClose}>Abbrechen</Button>
                <Button colorScheme="primary" type="submit" isLoading={props.isSubmitting}>Erstellen</Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  )
}
