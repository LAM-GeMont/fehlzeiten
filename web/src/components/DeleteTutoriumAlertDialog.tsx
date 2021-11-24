import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, useToast } from "@chakra-ui/react"
import React from "react"
import { useDeleteTutoriumMutation } from "../generated/graphql"
import { toastApolloError } from "../util"

interface Props {
    isOpen: boolean,
    onClose: () => void,
    rowId: string,
    name: string
}

export const DeleteTutoriumAlertDialog: React.FC<Props> = ({isOpen, onClose, rowId, name}) => {
    const toast = useToast()

    const [remove, removeMutation] = useDeleteTutoriumMutation({
        onError: errors => toastApolloError(toast, errors)
    })

    return (
        <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={undefined} isCentered>
            <AlertDialogOverlay />
            <AlertDialogContent>
            <AlertDialogHeader>Tutorium löschen</AlertDialogHeader>
            <AlertDialogBody>Sind Sie sich sicher, dass sie das Tutorium {name} löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogBody>
            <AlertDialogFooter>
                <Button mr={3} variant="ghost" onClick={onClose}>Abbrechen</Button>
                <Button colorScheme="red" type="submit" onClick={ async () => {
                    const res = await remove({
                        variables: { deleteTutoriumData: {id: rowId}},
                        refetchQueries: "all"
                    })
                    const errors = res.data.deleteTutorium.errors
                    if (errors) {
                        errors.forEach(error => {
                            toast({
                                title: "Fehler beim löschen des Tutoriums",
                                description: error.message == null ? error.code: `${error.code}: ${error.message}`,
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
                >Löschen</Button>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}