import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast } from "@chakra-ui/react"
import {Field, Form, Formik} from 'formik'
import {FormControl, FormLabel, Input, FormErrorMessage} from '@chakra-ui/react'
import { Tutorium, TutoriumEditErrorCode, useEditTutoriumMutation } from "../generated/graphql"
import { toastApolloError } from "../util"

interface Props {
    isOpen: boolean,
    onClose: () => void,
    rowName: string
}

const validateName = (value: string) => {
    let error
    if (!value || value.length===0) {
        error = "Ein Name muss festgelegt werden"
    }
    return error
}

export const EditTutoriumModal: React.FC<Props> = ({ isOpen, onClose, rowName }) => {

    const toast = useToast()
    const [create] = useEditTutoriumMutation({
        onError: errors => toastApolloError(toast, errors)
    })

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <Formik
                    initialValues={{
                        name: ""
                    }}
                    onSubmit={ async (values, actions) => {
                        const res = await create({
                            variables: { editTutoriumData: values },
                            refetchQueries: "active",
                        })
                        const errors = res.data?.editTutorium.errors
                        if (errors) {
                            errors.forEach(error => {
                                if (error.code == TutoriumEditErrorCode.DuplicateName) {
                                    actions.setFieldError("name", "Dieses Tutorium gibt es bereits, wählen sie einen anderen Namen")
                                } else {
                                    toast({
                                        title: "Fehler bei der Erstellung",
                                        description: error.message == null ? error.code : `${error.code}: ${error.message}`,
                                        status: "error",
                                        isClosable: true
                                    })
                                }
                            })
                        } else if (res.data.editTutorium.tutorium) {
                            onClose()
                        }
                    }}
                >
                    {(props) => (
                        <Form>
                            <ModalHeader>Tutorium Bearbeiten: {rowName}</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                <Field name="name" validate={validateName}>
                                    {({ field, form }) => (
                                        <FormControl isInvalid={form.errors.name && form.touched.name}>
                                            <FormLabel htmlFor="name">Name des Tutoriums</FormLabel>
                                            <Input {...field} id="name" placeholder={rowName}/>
                                            <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                                        </FormControl>
                                    )}
                                </Field>
                            </ModalBody>
                            <ModalFooter>
                                <Button mr={3} variant="ghost" onClick={onClose}>Abbrechen</Button>
                                <Button colorScheme="primary" type="submit" isLoading={props.isSubmitting}>Bearbeiten</Button>
                            </ModalFooter>
                        </Form>
                    )}
                </Formik>
            </ModalContent>
        </Modal>
    )
}