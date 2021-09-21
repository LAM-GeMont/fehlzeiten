import { ApolloClient, useApolloClient } from "@apollo/client";
import { Button, Center, Flex, FormControl, FormErrorMessage, FormLabel, Heading, Input, useToast } from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react"
import WithAuth from "../components/withAuth";
import { useLoginMutation, useSelfQuery } from "../generated/graphql";
import { toastApolloError } from "../util";

interface LoginProps {
  
}

const validateName = (value: string) => {
  let error
  if (!value || value.length === 0) {
    error = "Ein Name muss angegeben werden"
  }
  return error
}

const validatePassword = (value: string) => {
  let error
  if (!value || value.length === 0) {
    error = "Ein Passwort muss angegeben werden"
  }
  return error
}

const Login: React.FC<LoginProps> = ({}) => {
  
  const toast = useToast()
  const router = useRouter()

  const client = useApolloClient()

  const [login] = useLoginMutation({
    onError: errors => toastApolloError(toast, errors),
    onCompleted: () => client.cache.evict({fieldName: 'self'})
  })

  return (
    <Center w="100vw" h="100vh">
      <Flex w="sm" boxShadow="base" borderRadius="md" padding={8} direction="column">
        <Heading textAlign="center" mb={5}>Login</Heading>
        <Formik
          initialValues={{
            name: "",
            password: ""
          }}
          onSubmit={async (values, actions) => {
            const res = await login({
              variables: { loginUserData: values }
            })

            if (res.data?.loginUser.user != null && res.data?.loginUser.errors == null) {
              router.push("/")
            } else {
              actions.setErrors({
                name: "Falsches Passwort oder unbekannter Benutzer",
                password: "Falsches Passwort oder unbekannter Benutzer"
              })
            }

          }}
        >
          {(props) => (
            <Form>
              <Flex direction="column">
                <Field name="name" validate={validateName}>
                  {({ field, form }) => (
                    <FormControl isInvalid={form.errors.name && form.touched.name}>
                      <FormLabel htmlFor="name">Benutzername</FormLabel>
                      <Input {...field} id="name" placeholder="Name" />
                      <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="password" validate={validatePassword}>
                  {({ field, form }) => (
                    <FormControl mt={3} isInvalid={form.errors.password && form.touched.password}>
                      <FormLabel htmlFor="password">Passwort</FormLabel>
                      <Input {...field} id="password" type="password" placeholder="Passwort" />
                      <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Button colorScheme="primary" mt={4} alignSelf="flex-end" type="submit" isLoading={props.isSubmitting}>Login</Button>
              </Flex>
            </Form>
          )}
        </Formik>
      </Flex>
    </Center>
  );
}

export default WithAuth(Login, { redirectAuthorized: true, redirectTo: '/'})