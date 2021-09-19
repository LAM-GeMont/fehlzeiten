import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast } from "@chakra-ui/react"
import {Field, Form, Formik} from 'formik'
import {FormControl, FormLabel, Input, FormErrorMessage} from '@chakra-ui/react'
import { Tutorium, TutoriumCreateErrorCode, useCreateTutoriumMutation } from "../generated/graphql"

interface Props {
  isOpen: boolean,
  onClose: () => void,
  onCreate: (Tutorium) => void
}

const validateName = (value: string) => {
  let error
  if (!value || value.length===0) {
    error = "Ein Name muss festgelegt werden"
  }
  return error
}

export const CreateTutoriumModal: React.FC<Props> = ({ isOpen, onClose, onCreate }) => {

  const [create] = useCreateTutoriumMutation()
  const toast = useToast()

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
              variables: values,
            })
            const errors = res.data?.createTutorium.errors
            if (errors) {
              errors.forEach(error => {
                if (error.code == TutoriumCreateErrorCode.DuplicateName) {
                  actions.setFieldError("name", "Dieses Tutorium gibt es bereits, wählen sie einen anderen Namen")
                } else {
                  toast({
                    title: "Fehler bei der Erstellung",
                    description: `${error.code}: ${error.message || ""}`,
                    status: "error",
                    isClosable: true
                  })
                }
              })
            } else if (res.data.createTutorium.tutorium) {
              onCreate(res.data.createTutorium.tutorium)
            }
          }}
        >
          {(props) => (
            <Form>
              <ModalHeader>Tutorium erstellen</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Field name="name" validate={validateName}>
                  {({ field, form }) => (
                    <FormControl isInvalid={form.errors.name && form.touched.name}>
                      <FormLabel htmlFor="name">Name des Tutoriums</FormLabel>
                      <Input {...field} id="name" placeholder="Name" />
                      <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </ModalBody>
              <ModalFooter>
                <Button mr={3} variant="ghost" onClick={onClose}>Abbrechen</Button>
                <Button colorScheme="primary" type="submit" isLoading={props.isSubmitting}>Erstellen</Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  )
}