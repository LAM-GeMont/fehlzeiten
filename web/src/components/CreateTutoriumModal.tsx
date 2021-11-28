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
  Box,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage
} from '@chakra-ui/react'
import { Field, Form, Formik } from 'formik'
import { TutoriumCreateErrorCode, useCreateTutoriumMutation, useTeachersQuery } from '../generated/graphql'
import { toastApolloError } from '../util'

import React, { useMemo } from 'react'
import { SearchSelectInputSingle } from './SearchSelectInput'

interface Props {
  isOpen: boolean,
  onClose: () => void,
}

// Check if a name was put into the field
const validateName = (value: string) => {
  let error
  if (!value || value.length === 0) {
    error = 'Ein Name muss festgelegt werden'
  }
  return error
}

export const CreateTutoriumModal: React.FC<Props> = ({ isOpen, onClose }) => {
  // Creating toast, establishing connections with useCreateTutoriumMutation and gather errors saved in errors
  const toast = useToast()
  const [create] = useCreateTutoriumMutation({
    onError: errors => toastApolloError(toast, errors)
  })

  // Creating teacher query for later gathering of teacher data
  const teachersQuery = useTeachersQuery({
    onError: errors => toastApolloError(toast, errors)
  })

  // Gather teacherData from memo
  const teachersData = useMemo(() => {
    if (teachersQuery.data?.users != null) {
      return teachersQuery.data.users
    } else {
      return []
    }
  }, [teachersQuery.data])

  // Returning Modal for Tutorium Creation
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>
      <ModalContent>
        <Formik
          initialValues={{
            name: '',
            tutorId: ''
          }}
          onSubmit={async (values, actions) => {
            const res = await create({
              variables: { createTutoriumData: values },
              refetchQueries: 'active'
            })
            const errors = res.data?.createTutorium.errors
            if (errors) {
              errors.forEach(error => {
                if (error.code === TutoriumCreateErrorCode.DuplicateName) {
                  actions.setFieldError('name', 'Dieses Tutorium gibt es bereits. Bitte wählen sie einen anderen Namen')
                } else {
                  toast({
                    title: 'Fehler bei der Erstellung',
                    description: error.message == null ? error.code : `${error.code}: ${error.message}`,
                    status: 'error',
                    isClosable: true
                  })
                }
              })
            } else if (res.data.createTutorium.tutorium) {
              toast({
                title: `Tutorium ${res.data.createTutorium.tutorium.name} hinzugefügt`,
                description: `Das Tutorium ${res.data.createTutorium.tutorium.name} wurde erfolgreich erstellt`,
                status: 'success',
                isClosable: true
              })
              onClose()
            }
          }}
        >
          {(props) => (
            <Form>
              <ModalHeader>Tutorium erstellen</ModalHeader>
              <ModalCloseButton/>
              <ModalBody>
                <Field name="name" validate={validateName}>
                  {({ field, form }) => (
                    <FormControl isRequired isInvalid={form.errors.name && form.touched.name}>
                      <FormLabel htmlFor="name">Name des Tutoriums</FormLabel>
                      <Input {...field} id="name" placeholder="Name"autoFocus={true}/>
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
                <Button colorScheme="primary" type="submit" isLoading={props.isSubmitting}>Erstellen</Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  )
}
