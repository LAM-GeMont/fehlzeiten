import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast } from "@chakra-ui/react"
import {Field, Form, Formik} from 'formik'
import { useDeleteTutoriumMutation } from "../generated/graphql"
import { toastApolloError } from "../util"

interface Props {
    isOpen: boolean,
    onClose: () => void,
    rowId: string
}

export const DeleteTutoriumModal: React.FC<Props> = ({ isOpen, onClose, rowId }) => {
    const toast = useToast()

    const [ remove, removeMutation ] = useDeleteTutoriumMutation({
        onError: errors => toastApolloError(toast, errors),
        onCompleted: (res) => {
            res.deleteTutorium.errors.forEach(error => {
                toast({
                    title: "Fehler beim Löschen",
                    description: error.code,
                    isClosable: true,
                    status: "error"
                })
            })
        }
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
                        remove({
                            variables: { deleteTutoriumData: { id: rowId }},
                            refetchQueries: "all",
                        })
                        onClose()
                    }}
                >
                    {(props) => (
                        <Form>
                            <ModalHeader>Tutorium löschen</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                Sind Sie sich sicher, dass Sie das Tutorium {rowId} löschen möchten?
                            </ModalBody>
                            <ModalFooter>
                                <Button mr={3} variant="ghost" onClick={onClose}>Abbrechen</Button>
                                <Button colorScheme="red" type="submit" isLoading={props.isSubmitting}>Bestätigen</Button>
                            </ModalFooter>
                        </Form>
                    )}
                </Formik>
            </ModalContent>
        </Modal>
    )
}