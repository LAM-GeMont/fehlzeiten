import React from 'react'
import { PageScaffold } from '../components/PageScaffold'
import WithAuth, { WithAuthProps } from '../components/withAuth'
import {
  Button, Checkbox, CheckboxGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input, Switch,
  Flex, Box
} from '@chakra-ui/react'
import { Field, Form, Formik } from 'formik'
import { formatDateISO } from '../util'
import { useCreateAbsencesMutation, useStudentsQuery } from '../generated/graphql'
import { SearchSelectInputMultiple } from '../components/SearchSelectInput'

interface Props extends WithAuthProps {
}

const AbsencePage: React.FC<Props> = ({ self }) => {
  const initialDate = formatDateISO(new Date())
  const lessonIndexes = []
  for (let i = 1; i <= 10; i++) {
    lessonIndexes.push(i)
  }

  const studentsQuery = useStudentsQuery()
  const [createAbsences] = useCreateAbsencesMutation()

  return (
    <PageScaffold role={self.role}>
      <Formik
        initialValues={{
          date: initialDate,
          lesson: [],
          students: [],
          exam: false
        }}
        onSubmit={async (values, actions) => {
          actions.setSubmitting(true)
          const res = await createAbsences({
            variables: {
              data: {
                date: values.date,
                studentIds: values.students,
                lessonIndexes: values.lesson.map(v => parseInt(v)),
                exam: values.exam
              }
            }
          })
          actions.setSubmitting(false)
          console.log(res)
        }}
      >
        {(props) => (
          <Form>
            <Field name="date">
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.date && form.touched.date} mb={6}>
                  <FormLabel htmlFor="date">Tag der Fehlzeit</FormLabel>
                  <Input {...field} id="date" type="date"/>
                  <FormErrorMessage>{form.errors.date}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Field name="lesson">
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.lesson && form.touched.lesson} mb={6}>
                  <FormLabel>Unterrichtsstunden</FormLabel>
                  <CheckboxGroup>
                    <Flex direction="column">
                      {lessonIndexes.map(v => <Checkbox {...field} key={v} value={v.toString()}>{v}. Stunde</Checkbox>)}
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
            />
            <Box mb={4} />
            <Button colorScheme="primary" type="submit" isLoading={props.isSubmitting}>Weiter</Button>
          </Form>
        )}
      </Formik>
    </PageScaffold>
  )
}

export default WithAuth(AbsencePage)
