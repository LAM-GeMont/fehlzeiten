import React, { useState } from 'react'
import { PageScaffold } from '../components/PageScaffold'
import WithAuth, { WithAuthProps } from '../components/withAuth'
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel, Heading,
  Input,
  Switch, useDisclosure,
  useToast
} from '@chakra-ui/react'
import { Field, Form, Formik } from 'formik'
import { formatDateISO, toastApolloError } from '../util'
import { AbsenceCreateErrorCode, useCreateAbsencesMutation, useStudentsQuery } from '../generated/graphql'
import { SearchSelectInputMultiple } from '../components/SearchSelectInput'
import { AbsenceUpgradeAlertDialog } from '../components/AbsenceUpgradeAlertDialog'

interface Props extends WithAuthProps {
}

const AbsencePage: React.FC<Props> = ({ self }) => {
  const absenceUpgradeAlertDialog = useDisclosure()
  const initialDate = formatDateISO(new Date())
  const lessonIndexes = []
  for (let i = 1; i <= 10; i++) {
    lessonIndexes.push(i)
  }
  const toast = useToast()

  const studentsQuery = useStudentsQuery()
  const [createAbsences] = useCreateAbsencesMutation({
    onError: errors => toastApolloError(toast, errors)
  })
  const [overwriteOnDuplicate, setOverwriteOnDuplicate] = useState(false)

  return (
    <PageScaffold role={self.role}>
      <Heading as="h1" size="xl" mb={3}>Fehlzeiten eintragen</Heading>
      <Formik
        initialValues={{
          date: initialDate,
          lesson: [],
          students: [],
          exam: false
        }}
        onSubmit={async (values, actions) => {
          actions.setSubmitting(true)
          console.log({
            date: values.date,
            studentIds: values.students,
            lessonIndexes: values.lesson.map(v => parseInt(v)),
            exam: values.exam,
            overwriteOnDuplicate
          })
          const res = await createAbsences({
            variables: {
              data: {
                date: values.date,
                studentIds: values.students,
                lessonIndexes: values.lesson.map(v => parseInt(v)),
                exam: values.exam,
                overwriteOnDuplicate
              }
            }
          })
          actions.setSubmitting(false)
          if (res.data) {
            let existingAbsences = 0
            const potentialUpgrades = []
            if (res.data.createAbsences.errors) {
              res.data.createAbsences.errors.forEach(error => {
                switch (error.code) {
                  case AbsenceCreateErrorCode.InvalidDate:
                    actions.setFieldError('date', 'Ungülitges Datum. Bitte wählen Sie ein gültiges Datum.')
                    break
                  case AbsenceCreateErrorCode.AbsenceAlreadyExists:
                    existingAbsences++
                    break
                  case AbsenceCreateErrorCode.AbsencePotentialUpgrade:
                    potentialUpgrades.push(error)
                    break
                  default:
                    toast({
                      title: 'Fehler bei der Erstellung',
                      description: error.message == null ? error.code : `${error.code}: ${error.message}`,
                      status: 'error',
                      isClosable: true
                    })
                    break
                }
              })
            }
            if (potentialUpgrades.length > 0) {
              setOverwriteOnDuplicate(true)
              absenceUpgradeAlertDialog.onOpen()
            } else {
              setOverwriteOnDuplicate(false)
              actions.resetForm()
            }
            if (res.data.createAbsences.absences || existingAbsences > 0) {
              const count = res.data.createAbsences.absences?.length || 0
              const title = count !== 1 ? `${count} Fehlzeiten erfolgreich eingetragen.` : 'Eine Fehlzeit erfolgreich eingetragen'
              let description
              if (existingAbsences > 0) {
                description = existingAbsences !== 1 ? `${existingAbsences} Fehlzeiten existierten bereits.` : 'Eine Fehlzeit existierte bereits.'
              }
              toast({
                title,
                description,
                status: 'success',
                isClosable: true
              })
            }
          }
        }}
      >
        {(props) => (
          <Form id="absence-creation">
            <Field name="date">
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.date && form.touched.date} mb={6}>
                  <FormLabel htmlFor="date">Tag</FormLabel>
                  <Input {...field} id="date" type="date" onChange={(event) => {
                    let targetValue = event.target.value
                    if (event.target.value === '') {
                      targetValue = formatDateISO(new Date())
                    }
                    form.setFieldValue(field.name, targetValue)
                  }}/>
                  <FormErrorMessage>{form.errors.date}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Field name="lesson" validate={values => {
              if (values.length < 1) {
                return 'Bitte mindestens eine Unterrichtsstunde auswählen.'
              }
            }}>
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.lesson && form.touched.lesson} mb={6}>
                  <FormLabel>Unterrichtsstunden</FormLabel>
                  <style>
                    {`#absence-creation .chakra-checkbox__control {
                      display: none;
                    }
                    #absence-creation .chakra-checkbox__label {
                      margin-left: 0;
                      width: 100%;
                    }
                    #absence-creation .chakra-checkbox__input:checked ~ .chakra-checkbox__label .chakra-button {
                      background: var(--chakra-colors-blue-500);
                      color: #ffffff;
                    }`}
                  </style>
                  <CheckboxGroup>
                    <Flex direction="column" display={{ base: 'flex', lg: 'grid' }} gridRowGap={2} gridColumnGap={2} gridTemplateColumns="1fr 1fr">
                      {lessonIndexes.map(v =>
                        <Checkbox
                          {...field}
                          key={v}
                          value={v.toString()}
                          width="100%"
                        >
                          <Box
                            as={Button}
                            width="100%"
                            onClick={(e) => (e.currentTarget.closest('.chakra-checkbox__label') as HTMLLabelElement).click() }
                          >{v}. Stunde</Box>
                        </Checkbox>
                      )}
                    </Flex>
                  </CheckboxGroup>
                  <FormErrorMessage>{form.errors.lesson}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Field name="exam">
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.exam && form.touched.exam} mb={6} display="flex" alignItems="center">
                  <Switch id="exam" {...field} />
                  <FormLabel htmlFor="exam" mb="0" marginInlineEnd={0} marginInlineStart={3}>Klausur</FormLabel>
                </FormControl>
              )}
            </Field>
            <SearchSelectInputMultiple
              name="students"
              label="Schüler"
              items={studentsQuery.data?.students}
              textTransformer={t => `${t.lastName}, ${t.firstName}`}
              valueTransformer={t => t.id}
              placeholder={'Keine Schüler gewählt'}
              validate={values => {
                if (values.length < 1) {
                  return 'Bitte mindestens eine Schüler auswählen.'
                }
              }}
            />
            <Box mb={4} />
            <Button colorScheme="primary" type="submit" isLoading={props.isSubmitting}>Weiter</Button>
            <AbsenceUpgradeAlertDialog isOpen={absenceUpgradeAlertDialog.isOpen} onClose={absenceUpgradeAlertDialog.onClose} />
          </Form>
        )}
      </Formik>
    </PageScaffold>
  )
}

export default WithAuth(AbsencePage)
