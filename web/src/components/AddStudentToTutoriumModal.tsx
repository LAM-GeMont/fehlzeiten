import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast
} from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { StudentEditErrorCode, useEditStudentMutation, useStudentsQuery } from '../generated/graphql'
import { toastApolloError } from '../util'

import React, { useMemo } from 'react'
import { SearchSelectInputSingle } from './SearchSelectInput'

interface Props {
    isOpen: boolean,
    onClose: () => void,
    studentId: string,
    firstName: string,
    lastName: string,
    tutoriumId: string
}

export const AddStudentToTutoriumModal: React.FC<Props> = ({ isOpen, onClose, firstName, lastName, tutoriumId }) => {
  // Creating toast, establishing connections with useCreateTutoriumMutation and gather errors saved in errors
  const toast = useToast()
  const [add] = useEditStudentMutation({
    onError: errors => toastApolloError(toast, errors)
  })

  // Creating teacher query for later gathering of teacher data
  const studentsQuery = useStudentsQuery({
    onError: errors => toastApolloError(toast, errors)
  })

  // Gather teacherData from memo
  const studentsData = useMemo(() => {
    if (studentsQuery.data?.students != null) {
      return studentsQuery.data.students
    } else {
      return []
    }
  }, [studentsQuery.data])

  // Returning Modal for Tutorium Creation
  return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent>
                <Formik
                    initialValues={{
                      id: '',
                      tutorium: tutoriumId
                    }}
                    onSubmit={async (values, actions) => {
                      const res = await add({
                        variables: { editStudentData: values },
                        refetchQueries: 'active'
                      })
                      const errors = res.data?.editStudent.errors
                      if (errors) {
                        errors.forEach(error => {
                          switch (error.code) {
                            case StudentEditErrorCode.NotFound:
                              actions.setFieldError('name', 'Schüler konnte nicht gefunden werden')
                              break

                            case StudentEditErrorCode.TutoriumNotFound:
                              actions.setFieldError('name', 'Tutorium konnte nicht gefunden werden')
                              break

                            default:
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
                          title: `Der Student ${firstName} ${lastName} hinzugefügt`,
                          description: `Der Student ${firstName} ${lastName} wurde dem Tutorium ${res.data.editStudent.student.tutorium.name} erfolgreich hinzugefügt`,
                          status: 'success',
                          isClosable: true
                        })
                        onClose()
                      }
                    }}
                >
                    {(props) => (
                        <Form>
                            <ModalHeader>Schüler zu Tutorium hinzufügen</ModalHeader>
                            <ModalCloseButton/>
                            <ModalBody>
                                <SearchSelectInputSingle
                                    name="id"
                                    label="Schüler (optional)"
                                    items={studentsData}
                                    valueTransformer={t => t.id}
                                    textTransformer={t => t.firstName + ' ' + t.lastName}
                                    placeholder="Kein Schüler gewählt"
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button mr={3} variant="ghost" onClick={onClose}>Abbrechen</Button>
                                <Button colorScheme="primary" type="submit" isLoading={props.isSubmitting}>Hinzufügen</Button>
                            </ModalFooter>
                        </Form>
                    )}
                </Formik>
            </ModalContent>
        </Modal>
  )
}
