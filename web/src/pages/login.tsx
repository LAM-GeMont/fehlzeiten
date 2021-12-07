import { useApolloClient } from '@apollo/client'
import {
  Button,
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  useToast
} from '@chakra-ui/react'
import { Field, Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import React from 'react'
import WithAuth from '../components/withAuth'
import { useLoginMutation } from '../generated/graphql'
import { toastApolloError } from '../util'
import { Divider } from '@chakra-ui/layout'

interface LoginProps {

}

const validateName = (value: string) => {
  let error
  if (!value || value.length === 0) {
    error = 'Ein Name muss angegeben werden'
  }
  return error
}

const validatePassword = (value: string) => {
  let error
  if (!value || value.length === 0) {
    error = 'Ein Passwort muss angegeben werden'
  }
  return error
}

const Login: React.FC<LoginProps> = () => {
  const toast = useToast()
  const router = useRouter()

  const client = useApolloClient()

  const [login] = useLoginMutation({
    onError: errors => toastApolloError(toast, errors),
    onCompleted: () => client.cache.evict({ fieldName: 'self' }),
    refetchQueries: 'all'
  })

  return (
    <Center w="100vw" h="100vh">
      <Flex w="sm" boxShadow="base" borderRadius="md" padding={8} direction="column">
        <Heading textAlign="center" mb={5}>Login</Heading>
        <Button colorScheme="orange" mb={4} type="button" onClick={() => { window.location.href = '/api/login' }}>
          Mit IServ einloggen</Button>
        <Divider mb={4} />
        <span style={{ color: 'lightgray', cursor: 'pointer', fontSize: 14, textAlign: 'center' }} onClick={event => {
          event.currentTarget.style.display = 'none';
          (event.currentTarget.nextElementSibling as HTMLFormElement).style.display = 'block'
        }}>Entwicklerlogin anzeigen</span>
        <Formik
          initialValues={{
            name: '',
            password: ''
          }}
          onSubmit={async (values, actions) => {
            const res = await login({
              variables: { loginUserData: values }
            })

            if (res.data?.loginUser.user != null && res.data?.loginUser.errors == null) {
              await router.push('/')
            } else {
              actions.setErrors({
                name: 'Falsches Passwort oder unbekannter Benutzer',
                password: 'Falsches Passwort oder unbekannter Benutzer'
              })
            }
          }}
                >
                    {(props) => (
                        <Form style={{ display: 'none' }}>
                            <Flex direction="column">
                                <Field name="name" validate={validateName}>
                                    {({ field, form }) => (
                                        <FormControl isInvalid={form.errors.name && form.touched.name}>
                                            <FormLabel htmlFor="name">Benutzername</FormLabel>
                                            <Input {...field} id="name" placeholder="Name"/>
                                            <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                                        </FormControl>
                                    )}
                                </Field>
                                <Field name="password" validate={validatePassword}>
                                    {({ field, form }) => (
                                        <FormControl mt={3} isInvalid={form.errors.password && form.touched.password}>
                                            <FormLabel htmlFor="password">Passwort</FormLabel>
                                            <Input {...field} id="password" type="password" placeholder="Passwort"/>
                                            <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                                        </FormControl>
                                    )}
                                </Field>
                                <Flex justifyContent="end">
                                    <Button colorScheme="primary" mt={4} ml="auto" type="submit"
                                            isLoading={props.isSubmitting}>Login</Button>
                                </Flex>
                            </Flex>
                        </Form>
                    )}
                </Formik>
            </Flex>
        </Center>
  )
}

export default WithAuth(Login, { redirectAuthorized: true, redirectTo: '/' })
