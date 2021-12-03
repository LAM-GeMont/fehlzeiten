import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useToast
} from '@chakra-ui/react'
import React from 'react'
import { useDeleteSemesterMutation } from '../generated/graphql'
import { toastApolloError } from '../util'

interface Props {
  isOpen: boolean,
  onClose: () => void,
  semesterId: string,
  name: string
}

export const DeleteSemesterAlertDialog: React.FC<Props> = ({ isOpen, onClose, semesterId, name }) => {
  const toast = useToast()

  const [remove] = useDeleteSemesterMutation({
    onError: errors => toastApolloError(toast, errors),
    refetchQueries: 'all'
  })

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={undefined} isCentered>
      <AlertDialogOverlay/>
      <AlertDialogContent>
        <AlertDialogHeader>Zeitspanne löschen</AlertDialogHeader>
        <AlertDialogBody>Sind Sie sich sicher, dass Sie die Zeitspanne {name} löschen möchten? Diese Aktion kann nicht
          rückgängig gemacht werden.</AlertDialogBody>
        <AlertDialogFooter>
          <Button mr={3} variant="ghost" onClick={onClose}>Abbrechen</Button>
          <Button colorScheme="red" type="submit" onClick={async () => {
            const res = await remove({
              variables: { data: { id: semesterId } },
              refetchQueries: 'all'
            })
            const errors = res.data.deleteSemester.errors
            if (errors) {
              errors.forEach(error => {
                toast({
                  title: 'Fehler beim löschen der Zeitspanne',
                  description: error.message == null ? error.code : `${error.code}: ${error.message}`,
                  isClosable: true,
                  status: 'error'
                })
              })
            } else {
              toast({
                title: 'Zeitspanne gelöscht',
                description: 'Die Zeitspanne wurde erfolgreich gelöscht.',
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
