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
import { useDeleteExcuseMutation } from '../generated/graphql'
import { toastApolloError } from '../util'

interface Props {
  isOpen: boolean,
  onClose: () => void,
  rowId: string
}

export const DeleteExcuseAlertDialog: React.FC<Props> = ({ isOpen, onClose, rowId }) => {
  const toast = useToast()

  const [remove] = useDeleteExcuseMutation({
    onError: errors => toastApolloError(toast, errors),
    refetchQueries: 'all'
  })

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={undefined} isCentered>
      {console.log('test' + rowId)}
      <AlertDialogOverlay/>
      <AlertDialogContent>
        <AlertDialogHeader>Entschuldigung löschen</AlertDialogHeader>
        <AlertDialogBody>Sind Sie sich sicher, dass sie diese Entschuldigung löschen möchten? Diese Aktion kann nicht
          rückgängig gemacht werden.</AlertDialogBody>
        <AlertDialogFooter>
          <Button mr={3} variant="ghost" onClick={onClose}>Abbrechen</Button>
          <Button colorScheme="red" type="submit" onClick={async () => {
            const res = await remove({
              variables: { data: { id: rowId } },
              refetchQueries: 'all'
            })
            const errors = res.data.deleteExcuse.errors
            if (errors) {
              errors.forEach(error => {
                toast({
                  title: 'Fehler beim Löschen der Entschuldigung',
                  description: error.message == null ? error.code : `${error.code}: ${error.message}`,
                  isClosable: true,
                  status: 'error'
                })
              })
            } else {
              toast({
                title: 'Entschuldigung gelöscht',
                description: 'Die Entschudligung wurde erfolgreich gelöscht',
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
