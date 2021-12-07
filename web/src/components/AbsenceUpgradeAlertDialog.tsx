import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button
} from '@chakra-ui/react'
import React from 'react'

interface Props {
  isOpen: boolean,
  onClose: () => void
}

export const AbsenceUpgradeAlertDialog: React.FC<Props> = ({ isOpen, onClose }) => {
  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={undefined} isCentered>
      <AlertDialogOverlay/>
      <AlertDialogContent>
        <AlertDialogHeader>Fehlzeit als Klausur markieren</AlertDialogHeader>
        <AlertDialogBody>
          Eine oder mehrere Fehlzeiten existieren bereits als normale Fehlzeiten.
          Wollen Sie diese Fehlzeiten als Klausurfehlzeiten überschreiben?
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button mr={3} variant="ghost" onClick={onClose}>Abbrechen</Button>
          <Button colorScheme="green" type="submit" form="absence-creation" onClick={onClose}>Überschreiben</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
