import { Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast, FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/react'
import { Field, Form, Formik } from 'formik'

import { TutoriumEditErrorCode, useEditTutoriumMutation, useTeachersQuery } from '../generated/graphql'
import { toastApolloError } from '../util'
import React, { useMemo } from 'react'
import { SearchSelectInputSingle } from './SearchSelectInput'

interface Props {
  isOpen: boolean,
  onClose: () => void,
  tutoriumId: string,
  name: string,
  teacherId: string
}

const validateName = (value: string) => {
  let error: string
  if (!value || value.length === 0) {
    error = 'Es muss ein Name festgelegt werden'
  }
  return error
}

export const EditTutoriumAlertDialog: React.FC<Props> = ({ isOpen, onClose, tutoriumId, name, teacherId}) => {
  const toast = useToast()
  const [edit] = useEditTutoriumMutation({
    onError: errors => toastApolloError(toast, errors)
  })

  const teachersQuery = useTeachersQuery({
    onError: errors => toastApolloError(toast, errors)
  })

  const teachersData = useMemo(() => {
    if (teachersQuery.data?.users != null) {
      return teachersQuery.data.users
    } else {
      return []
    }
  }, [teachersQuery.data])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <Formik
          initialValues={{
            id: tutoriumId,
            name: name,
            tutor: teacherId
          }}
          onSubmit={ async (values, actions) => {
            const res = await edit({
              variables: { editTutoriumData: values },
              refetchQueries: 'active'
            })
            const errors = res.data?.editTutorium.errors
            if (errors) {
              errors.forEach(error => {
                if (error.code === TutoriumEditErrorCode.DuplicateName) {
                  actions.setFieldError('name', 'Dieses Tutorium gibt es bereits. Bitte wählen sie einen anderen Namen.')
                } else {
                  toast({
                    title: 'Fehler bei der Erstellung',
                    description: error.message == null ? error.code : `${error.code}: ${error.message}`,
                    status: 'error',
                    isClosable: true
                  })
                }
              })
            } else if (res.data.editTutorium.tutorium) {
              toast({
                title: `Tutorium ${res.data.editTutorium.tutorium.name} bearbeitet`,
                status: 'success',
                isClosable: true
              })
              onClose()
            }
          }}
        >
          {(props) => (
            <Form>
              <ModalHeader>Tutorium bearbeiten</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Field name="name" validate={validateName}>
                  {({ field, form }) => (
                    <FormControl isRequired isInvalid={form.errors.name && form.touched.name}>
                      <FormLabel htmlFor="name">Name</FormLabel>
                      <Input {...field} id="name" placeholder="name" autoFocus={true}/>
                      <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Box mt={4} />
                <SearchSelectInputSingle
                    name="tutorId"
                    label="Tutor (optional)"
                    items={teachersData}
                    valueTransformer={t => t.id}
                    textTransformer={t => t.name}
                    placeholder="Kein Lehrer gewählt"
                />
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
