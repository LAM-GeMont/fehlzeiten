import { Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, useToast, FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/react'
import { Field, Form, Formik } from 'formik'

import { StudentEditErrorCode, useEditStudentMutation, useTutoriumsQuery } from '../generated/graphql'
import { toastApolloError } from '../util'
import React, { useMemo } from 'react'

interface Props {
  isOpen: boolean,
  onClose: () => void,
  studentId: string,
  firstName: string,
  lastName: string,
  tutoriumId: string
}

const validateName = (value: string) => {
  let error: string
  if (!value || value.length === 0) {
    error = 'Es muss ein Name festgelegt werden'
  }
  return error
}

export const EditStudentModal: React.FC<Props> = ({ isOpen, onClose, studentId, firstName, lastName, tutoriumId }) => {
  const toast = useToast()
  const [edit] = useEditStudentMutation({
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
            id: studentId,
            firstName: firstName,
            lastName: lastName,
            tutorium: tutoriumId
          }}
          onSubmit={ async (values, actions) => {
            const res = await edit({
              variables: { editStudentData: values },
              refetchQueries: 'active'
            })
            const errors = res.data?.editStudent.errors
            if (errors) {
              errors.forEach(error => {
                if (error.code === StudentEditErrorCode.DuplicateName) {
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
            } else if (res.data.editStudent.student) {
              toast({
                title: `Schüler ${res.data.editStudent.student.firstName} ${res.data.editStudent.student.lastName} bearbeitet`,
                status: 'success',
                isClosable: true
              })
              onClose()
            }
          }}
        >
          {(props) => (
            <Form>
              <ModalHeader>Schüler bearbeitenn</ModalHeader>
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
                <Field name="tutorium">
                    {({ field }) => (
                        <FormControl id="tutorium">
                            <FormLabel>Tutorium (optional)</FormLabel>
                            <Select {...field} placeholder="Kein Tutorium">
                                {data.map(tutorium => {
                                  return <option value={tutorium.id} key={tutorium.id}> {tutorium.name}</option>
                                })}
                            </Select>
                        </FormControl>
                    )}
                </Field>
              </ModalBody>
              <ModalFooter>
                <Button mr={3} variant="ghost" onClick={onClose}>Abbrechen</Button>
                <Button colorScheme="primary" type="submit" isLoading={props.isSubmitting}>Speichern</Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  )
}
