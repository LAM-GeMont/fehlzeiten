import React from "react";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal, ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from "@chakra-ui/react";
import {Field, Form, Formik} from "formik";
import {formatDateISO} from "../util";
import {Box, Flex} from "@chakra-ui/layout";
import {
  Student,
  useCreateExcuseDaysMutation,
  useCreateExcuseLessonsMutation
} from "../generated/graphql";

interface Props {
  isOpen: boolean,
  onClose: () => void,
  student: Student
}

function handleStartEndDateChange(event, field, form) {
  let targetValue = event.target.value
  if (targetValue === '') {
    targetValue = formatDateISO(new Date())
  }
  form.setFieldValue(field.name, targetValue)
  if (event.type === 'blur') {
    if (event.target.id === 'startDate') {
      if (targetValue > form.values.endDate) {
        form.setFieldValue('endDate', targetValue)
      }
    } else {
      if (targetValue < form.values.startDate) {
        form.setFieldValue('startDate', targetValue)
      }
    }

  }
}

const ExcuseModal: React.FC<Props> = ({ isOpen, onClose, student }) => {
  const initialDate = formatDateISO(new Date())
  const lessonIndexes = []
  for (let i = 1; i <= 10; i++) {
    lessonIndexes.push(i)
  }

  const [createExcuseLessons] = useCreateExcuseLessonsMutation()
  const [createExcuseDays] = useCreateExcuseDaysMutation()

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Entschuldigung einreichen</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
        <Tabs isFitted variant="soft-rounded" width="100%">
          <TabList>
            <Tab>Einzelstunden</Tab>
            <Tab>Tage</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Formik
                initialValues={{
                  date: initialDate,
                  lesson: []
                }}
                onSubmit={async (values, actions) => {
                  actions.setSubmitting(true)
                  const res = await createExcuseLessons({ variables: {
                      data: {
                        startDate: values.date,
                        endDate: values.date,
                        studentId: student.id,
                        lessons: values.lesson.map(v => parseInt(v))
                      }
                    }})
                  actions.setSubmitting(false)
                  console.log(res)
                }}
              >
                {(props) => (
                  <Form id="from-hours">
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
                    <ModalFooter>
                      <Button mr={3} variant="ghost" onClick={onClose}>Abbrechen</Button>
                      <Button colorScheme="primary" type="submit" isLoading={props.isSubmitting}>Erstellen</Button>
                    </ModalFooter>
                  </Form>
                )}
              </Formik>
            </TabPanel>
            <TabPanel>
              <Formik
                initialValues={{
                  startDate: initialDate,
                  endDate: initialDate
                }}
                onSubmit={async (values, actions) => {
                  actions.setSubmitting(true)
                  const res = await createExcuseDays({ variables: {
                      data: {
                        startDate: values.startDate,
                        endDate: values.endDate,
                        studentId: student.id
                      }
                    }})
                  actions.setSubmitting(false)
                  console.log(res)
                }}
              >
                {(props) => (
                  <Form id="from-days">
                    <Field name="startDate">
                      {({field, form}) => (
                        <FormControl isInvalid={form.errors.startDate && form.touched.startDate} mb={6}>
                          <FormLabel htmlFor="startDate">Start der Fehlzeit</FormLabel>
                          <Input
                            {...field}
                            id="startDate"
                            type="date"
                            max={form.values.endDate}
                            onBlur={e => handleStartEndDateChange(e, field, form)}
                            onChange={e => handleStartEndDateChange(e, field, form)} />
                          <FormErrorMessage>{form.errors.startDate}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    <Field name="endDate">
                      {({field, form}) => (
                        <FormControl isInvalid={form.errors.endDate && form.touched.endDate} mb={6}>
                          <FormLabel htmlFor="endDate">Ende der Fehlzeit</FormLabel>
                          <Input
                            {...field}
                            id="endDate"
                            type="date"
                            min={form.values.startDate}
                            onBlur={e => handleStartEndDateChange(e, field, form)}
                            onChange={e => handleStartEndDateChange(e, field, form)} />
                          <FormErrorMessage>{form.errors.endDate}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    <Field>
                      {({field, form}) => (
                        <Box mb={6}>
                          {Math.round((new Date(form.values.endDate).getTime() - new Date(form.values.startDate).getTime()) / (1000*60*60*24)) + 1} Wochentag(e)
                        </Box>
                      )}
                    </Field>
                    <ModalFooter>
                      <Button mr={3} variant="ghost" onClick={onClose}>Abbrechen</Button>
                      <Button colorScheme="primary" type="submit" isLoading={props.isSubmitting}>Erstellen</Button>
                    </ModalFooter>
                  </Form>
                )}
              </Formik>
            </TabPanel>
          </TabPanels>
        </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ExcuseModal