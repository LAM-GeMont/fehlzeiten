import React from "react";
import {PageScaffold} from "../components/PageScaffold"
import WithAuth, {WithAuthProps} from "../components/withAuth";
import {
  Button, Checkbox, CheckboxGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input, Switch
} from "@chakra-ui/react";
import {Field, Form, Formik} from "formik";
import {formatDateISO} from "../util";
import {Flex} from "@chakra-ui/layout";
import {useCreateAbsencesMutation} from "../generated/graphql";

interface Props extends WithAuthProps {
}

const AbsencePage: React.FC<Props> = ({self}) => {
  const initialDate = formatDateISO(new Date())
  const lessonIndexes = []
  for (let i = 1; i <= 10; i++) {
    lessonIndexes.push(i)
  }

  const [createAbsences, { data, loading, error }] = useCreateAbsencesMutation()

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
          const res = await createAbsences({ variables: {
            data: {
              date: values.date,
              studentIds: values.students,
              lessonIndexes: values.lesson.map(v => parseInt(v)),
              exam: values.exam
            }
          }})
          actions.setSubmitting(false)
          console.log(res)
        }}
      >
        {(props) => (
          <Form>
            <Field name="date">
              {({field, form}) => (
                <FormControl isInvalid={form.errors.date && form.touched.date} mb={6}>
                  <FormLabel htmlFor="date">Tag der Fehlzeit</FormLabel>
                  <Input {...field} id="date" type="date"/>
                  <FormErrorMessage>{form.errors.date}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Field name="lesson">
              {({field, form}) => (
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
              {({field, form}) => (
                <FormControl isInvalid={form.errors.exam && form.touched.exam} mb={6} display="flex" alignItems="center">
                  <Switch id="exam" {...field} />
                  <FormLabel htmlFor="exam" mb="0" marginInlineEnd={0} marginInlineStart={3}>Klausur</FormLabel>
                </FormControl>
              )}
            </Field>
            <Field name="students">
              {({field, form}) => (
                <FormControl isInvalid={form.errors.students && form.touched.students} mb={6}>
                  <FormLabel>Schüler</FormLabel>
                  <CheckboxGroup>
                    <Flex direction="column">
                      <Checkbox {...field} key="ad07c79e-7d96-46dd-9cdf-8fccae1ba75b" value="ad07c79e-7d96-46dd-9cdf-8fccae1ba75b">Heinz Müller</Checkbox>
                    </Flex>
                  </CheckboxGroup>
                  <FormErrorMessage>{form.errors.students}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Button colorScheme="primary" type="submit" isLoading={props.isSubmitting}>Weiter</Button>
          </Form>
        )}
      </Formik>
    </PageScaffold>
  )
}

export default WithAuth(AbsencePage)
