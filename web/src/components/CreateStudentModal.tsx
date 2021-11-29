import { Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast, FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/react'
import { Field, Form, Formik } from 'formik'

import { StudentCreateErrorCode, useCreateStudentMutation, useTutoriumsQuery } from '../generated/graphql'
import { toastApolloError } from '../util'
import React, { useMemo } from 'react'
import { SearchSelectInputSingle } from './SearchSelectInput'

interface Props {
  isOpen: boolean,
  onClose: () => void,
}

const validateName = (value: string) => {
  let error: string
  if (!value || value.length === 0) {
    error = 'Es muss ein Name festgelegt werden'
  }
  return error
}

export const CreateStudentModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const toast = useToast()
  const [create] = useCreateStudentMutation({
    onError: errors => toastApolloError(toast, errors)
  })

  const tutoriumsQuery = useTutoriumsQuery({
    onError: errors => toastApolloError(toast, errors)
  })

  const data = useMemo(() => {
    if (tutoriumsQuery.data?.tutoriums != null) {
      return tutoriumsQuery.data.tutoriums
    } else {
      return []
    }
  }, [tutoriumsQuery.data])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            tutoriumId: ''
          }}
          onSubmit={ async (values, actions) => {
            const res = await create({
              variables: { createStudentData: values },
              refetchQueries: 'active'
            })
            const errors = res.data?.createStudent.errors
            if (errors) {
              errors.forEach(error => {
                if (error.code === StudentCreateErrorCode.DuplicateName) {
                  actions.setFieldError('firstName', 'Diesen Schüler gibt es bereits. Bitte wählen sie einen anderen Namen.')
                  actions.setFieldError('lastName', 'Diesen Schüler gibt es bereits. Bitte wählen sie einen anderen Namen.')
                } else {
                  toast({
                    title: 'Fehler bei der Erstellung',
                    description: error.message == null ? error.code : `${error.code}: ${error.message}`,
                    status: 'error',
                    isClosable: true
                  })
                }
              })
            } else if (res.data.createStudent.student) {
              toast({
                title: `Schüler ${res.data.createStudent.student.firstName} ${res.data.createStudent.student.lastName} hinzugefügt`,
                description: `Der Schüler ${res.data.createStudent.student.firstName} ${res.data.createStudent.student.lastName} wurde erfolgreich erstellt`,
                status: 'success',
                isClosable: true
              })
              onClose()
            }
          }}
        >
          {(props) => (
            <Form>
              <ModalHeader>Schüler erstellen</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Field name="firstName" validate={validateName}>
                  {({ field, form }) => (
                    <FormControl isRequired isInvalid={form.errors.firstName && form.touched.firstName}>
                      <FormLabel htmlFor="firstName">Vorname</FormLabel>
                      <Input {...field} id="firstName" placeholder="Vorname" autoFocus={true}/>
                      <FormErrorMessage>{form.errors.firstName}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Box mt={4} />
                <Field name="lastName" validate={validateName}>
                    {({ field, form }) => (
                    <FormControl isRequired isInvalid={form.errors.lastName && form.touched.lastName}>
                        <FormLabel htmlFor="lastName">Nachname</FormLabel>
                        <Input {...field} id="lastName" placeholder="Nachname" />
                        <FormErrorMessage>{form.errors.lastName}</FormErrorMessage>
                    </FormControl>
                    )}
                </Field>
                <Box mt={4} />
                <SearchSelectInputSingle
                  label="Tutorium (optional)"
                  name="tutoriumId"
                  placeholder="Kein Tutorium gewählt"
                  items={data}
                  textTransformer={t => t.name}
                  valueTransformer={t => t.id}
                />
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
