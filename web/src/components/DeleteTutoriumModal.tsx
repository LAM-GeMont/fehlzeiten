import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast } from "@chakra-ui/react"
import {Field, Form, Formik} from 'formik'
import { TutoriumDeleteErrorCode, useDeleteTutoriumMutation } from "../generated/graphql"
import { toastApolloError } from "../util"

interface Props {
    isOpen: boolean,
    onClose: () => void,
    rowId: string,
    rowName: string
}

export const DeleteTutoriumModal: React.FC<Props> = ({ isOpen, onClose, rowId, rowName}) => {
    const toast = useToast()

    const [ remove, removeMutation ] = useDeleteTutoriumMutation({
        onError: errors => toastApolloError(toast, errors)
    })

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <Formik
                    initialValues={{
                        id: ""
                    }}
                    onSubmit={ async (values, actions) => {
                        const res = await remove({
                            variables: { deleteTutoriumData: { id: rowId }},
                            refetchQueries: "all",
                        })
                        const errors = res.data?.deleteTutorium.errors
                        if (errors) {
                            errors.forEach(error => {
                                toast({
                                    title: "Fehler beim Löschen",
                                    description: error.message == null ? error.code : `${error.code}: ${error.message}`,
                                    isClosable: true,
                                    status: "error"
                                })
                            })
                        } else {
                            toast({
                                title: "Tutorium gelöscht",
                                description: "Das Tutorium wurde erfolgreich gelöscht",
                                isClosable: true,
                                status: "success"
                            })
                        }
                        onClose()
                    }}
                >
                    {(props) => (
                        <Form>
                            <ModalHeader>Tutorium löschen</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                Sind Sie sich sicher, dass Sie das Tutorium {rowName} löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                            </ModalBody>
                            <ModalFooter>
                                <Button mr={3} variant="ghost" onClick={onClose}>Abbrechen</Button>
                                <Button colorScheme="red" type="submit" isLoading={props.isSubmitting}>Löschen</Button>
                            </ModalFooter>
                        </Form>
                    )}
                </Formik>
            </ModalContent>
        </Modal>
    )
}