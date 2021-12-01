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
import { AddStudentToTutoriumErrorCode, useAddStudentToTutoriumMutation, useStudentsQuery } from '../generated/graphql'
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

export const AddStudentToTutorium: React.FC<Props> = ({ isOpen, onClose, studentId, firstName, lastName, tutoriumId }) => {
    // Creating toast, establishing connections with useCreateTutoriumMutation and gather errors saved in errors
    const toast = useToast()
    const [add] = useAddStudentToTutoriumMutation({
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
                        tutorId: ''
                    }}
                    onSubmit={async (values, actions) => {
                        const res = await add({
                            variables: { addStudentToTutoriumData: values },
                            refetchQueries: 'active'
                        })
                        const errors = res.data?.addStudentToTutorium.errors
                        if (errors) {
                            errors.forEach(error => {
                                if (error.code === AddStudentToTutoriumErrorCode.StudentNotFound) {
                                    actions.setFieldError('name', 'Schüler konnte nicht gefunden werden')
                                } else {
                                    if (error.code === AddStudentToTutoriumErrorCode.TutoriumNotFound) {
                                        actions.setFieldError('name', 'Tutorium konnte nicht gefunden werden')
                                    } else {
                                        toast({
                                            title: 'Fehler bei der Erstellung',
                                            description: error.message == null ? error.code : `${error.code}: ${error.message}`,
                                            status: 'error',
                                            isClosable: true
                                        })
                                    }
                                }
                            })
                        } else if (res.data.addStudentToTutorium.student) {
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
                            <ModalHeader>Schüler zu Tutorium hinzufügen</ModalHeader>
                            <ModalCloseButton/>
                            <ModalBody>
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
                                <Button colorScheme="primary" type="submit" isLoading={props.isSubmitting}>Hinzufügen</Button>
                            </ModalFooter>
                        </Form>
                    )}
                </Formik>
            </ModalContent>
        </Modal>
    )
}
