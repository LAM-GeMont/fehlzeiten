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
import { useDeleteAbsenceMutation } from '../generated/graphql'
import { toastApolloError } from '../util'

interface Props {
  isOpen: boolean,
  onClose: () => void,
  rowId: string
}

export const DeleteAbsenceAlertDialog: React.FC<Props> = ({ isOpen, onClose, rowId }) => {
  const toast = useToast()

  const [remove] = useDeleteAbsenceMutation({
    onError: errors => toastApolloError(toast, errors)
  })

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={undefined} isCentered>
      {console.log('test' + rowId)}
      <AlertDialogOverlay/>
      <AlertDialogContent>
        <AlertDialogHeader>Fehlzeit löschen</AlertDialogHeader>
        <AlertDialogBody>Sind Sie sich sicher, dass sie diese Fehlzeit löschen möchten? Diese Aktion kann nicht
          rückgängig gemacht werden.</AlertDialogBody>
        <AlertDialogFooter>
          <Button mr={3} variant="ghost" onClick={onClose}>Abbrechen</Button>
          <Button colorScheme="red" type="submit" onClick={async () => {
            const res = await remove({
              variables: { data: { id: rowId } },
              refetchQueries: 'all'
            })
            const errors = res.data.deleteAbsence.errors
            if (errors) {
              errors.forEach(error => {
                toast({
                  title: 'Fehler beim löschen der Fehlzeit',
                  description: error.message == null ? error.code : `${error.code}: ${error.message}`,
                  isClosable: true,
                  status: 'error'
                })
              })
            } else {
              toast({
                title: 'Fehlzeit gelöscht',
                description: 'Die Fehlzeit wurde erfolgreich gelöscht',
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
