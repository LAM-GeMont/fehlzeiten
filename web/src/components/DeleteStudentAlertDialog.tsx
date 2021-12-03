import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, useToast } from '@chakra-ui/react'
import React from 'react'
import { useDeleteStudentMutation } from '../generated/graphql'
import { toastApolloError } from '../util'

interface Props {
    isOpen: boolean,
    onClose: () => void,
    rowId: string,
    firstName: string,
    lastName: string
}

export const DeleteStudentAlertDialog: React.FC<Props> = ({ isOpen, onClose, rowId, firstName, lastName }) => {
  const toast = useToast()

  const [remove] = useDeleteStudentMutation({
    onError: errors => toastApolloError(toast, errors),
    refetchQueries: 'all'
  })

  return (
        <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={undefined} isCentered>
            <AlertDialogOverlay />
            <AlertDialogContent>
            <AlertDialogHeader>Schüler löschen</AlertDialogHeader>
            <AlertDialogBody>Sind Sie sich sicher, dass sie den Schüler {firstName} {lastName} löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogBody>
            <AlertDialogFooter>
                <Button mr={3} variant="ghost" onClick={onClose}>Abbrechen</Button>
                <Button colorScheme="red" type="submit" onClick={ async () => {
                  const res = await remove({
                    variables: { deleteStudentData: { id: rowId } },
                    refetchQueries: 'all'
                  })
                  const errors = res.data.deleteStudent.errors
                  if (errors) {
                    errors.forEach(error => {
                      toast({
                        title: 'Fehler beim löschen des Schülers',
                        description: error.message == null ? error.code : `${error.code}: ${error.message}`,
                        isClosable: true,
                        status: 'error'
                      })
                    })
                  } else {
                    toast({
                      title: 'Schüler gelöscht',
                      description: 'Der Schüler wurde erfolgreich gelöscht',
                      isClosable: true,
                      status: 'success'
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
