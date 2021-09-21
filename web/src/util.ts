import { ApolloError } from "@apollo/client";

const toastError = (toast, error) => {
  toast({
      title: "Interner Fehler",
      description: `${error.name}: ${error.message}`,
      status: "error",
      isClosable: true,
  })
}

export const toastApolloError = (toast, errors: ApolloError) => {
  if (errors.clientErrors) {
    errors.clientErrors.forEach( error => toastError(toast, error))
  }

  if (errors.graphQLErrors) {
    errors.graphQLErrors.forEach( error => toastError(toast, error))
  }
  
  if (errors.networkError != null) {
    toast({
      title: "Netzwerk Fehler",
      description: `${errors.networkError.name}: ${errors.networkError.message}`,
      status: "error",
      isClosable: true
    })
  }
}
