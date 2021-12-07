import React, { useState } from 'react'
import { PageScaffold } from '../components/PageScaffold'
import WithAuth, { WithAuthProps } from '../components/withAuth'
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel, Heading,
  Input,
  Switch, useDisclosure,
  useToast
} from '@chakra-ui/react'
import { Field, FieldProps, Form, Formik, useField } from 'formik'
import { formatDateISO, toastApolloError } from '../util'
import { AbsenceCreateErrorCode, useCreateAbsencesMutation, useStudentsQuery } from '../generated/graphql'
import { SearchSelectInputMultiple } from '../components/SearchSelectInput'
import { AbsenceUpgradeAlertDialog } from '../components/AbsenceUpgradeAlertDialog'

interface LessonButtonProps {
  name: string
  items: string[]
  labels: string[]
  label: string
  validate: (value: string[]) => string
}

const ToggleButtonGroup: React.FC<LessonButtonProps> = ({ items, labels, label, ...props }) => {
  const [field, meta, helpers] = useField<string[]>({ name: props.name, validate: props.validate })

  const handleChange = (item: string) => {
    const newValue = meta.value.slice() || []
    const index = newValue.indexOf(item)
    if (index !== -1) {
      newValue.splice(index, 1)
    } else {
      newValue.push(item)
    }
    helpers.setValue(newValue)
  }

  return (
    <FormControl mb={6} {...props} isInvalid={meta.touched && meta.error != null}>
      <FormLabel>{label}</FormLabel>
      <Flex direction="column" display={{ base: 'flex', lg: 'grid' }} gridRowGap={2} gridColumnGap={2} gridTemplateColumns="1fr 1fr">
        {items.map((v, i) =>
          <>
            <Button width="full" onClick={() => handleChange(v)} name={props.name} onBlur={field.onBlur} colorScheme={meta.value.includes(v) ? 'blue' : undefined}>{labels[i]}</Button>
          </>
        )}
      </Flex>
      <FormErrorMessage>{meta.error}</FormErrorMessage>
    </FormControl>
  )
}

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

  const studentsQuery = useStudentsQuery({
    pollInterval: 60000
  })

  const [createAbsences] = useCreateAbsencesMutation({
    onError: errors => toastApolloError(toast, errors),
    refetchQueries: 'all'
  })

  const [overwriteOnDuplicate, setOverwriteOnDuplicate] = useState(false)

  return (
    <PageScaffold role={self.role}>
      <Heading as="h1" size="xl" mb={3}>Fehlzeiten eintragen</Heading>
      <Formik
        initialValues={{
          date: initialDate,
          lessons: [],
          students: [],
          exam: false
        }}
        onSubmit={async (values, actions) => {
          actions.setSubmitting(true)
          console.log({
            date: values.date,
            studentIds: values.students,
            lessonIndexes: values.lessons.map(v => parseInt(v)),
            exam: values.exam,
            overwriteOnDuplicate
          })
          const res = await createAbsences({
            variables: {
              data: {
                date: values.date,
                studentIds: values.students,
                lessonIndexes: values.lessons.map(v => parseInt(v)),
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
          <Form>
          {console.log('form', props)}
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
            <ToggleButtonGroup name="lessons" items={lessonIndexes} labels={lessonIndexes.map(i => `${i}. Stunde`)} label="Unterrichtsstunden" validate={values => {
              if (values.length < 1) {
                return 'Bitte mindestens eine Unterrichtsstunde auswählen.'
              }
            }} />
            <Field name="exam" type="checkbox">
              {({ field }: FieldProps) => (
                <FormControl mb={6} display="flex" alignItems="center">
                  <Switch id="exam" {...field} isChecked={field.checked}/>
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
            <Flex justifyContent="flex-end">
              <Button colorScheme="primary" type="submit" isLoading={props.isSubmitting}>Eintragen</Button>
            </Flex>
            <AbsenceUpgradeAlertDialog isOpen={absenceUpgradeAlertDialog.isOpen} onClose={absenceUpgradeAlertDialog.onClose} />
          </Form>
        )}
      </Formik>
    </PageScaffold>
  )
}

export default WithAuth(AbsencePage)
