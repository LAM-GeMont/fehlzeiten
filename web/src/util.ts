import { ApolloError } from '@apollo/client'

const toastError = (toast, error) => {
  toast({
    title: 'Interner Fehler',
    description: `${error.name}: ${error.message}`,
    status: 'error',
    isClosable: true
  })
}

export const toastApolloError = (toast, errors: ApolloError) => {
  if (errors.clientErrors) {
    errors.clientErrors.forEach(error => toastError(toast, error))
  }

  if (errors.graphQLErrors) {
    errors.graphQLErrors.forEach(error => toastError(toast, error))
  }

  if (errors.networkError != null) {
    toast({
      title: 'Netzwerk Fehler',
      description: `${errors.networkError.name}: ${errors.networkError.message}`,
      status: 'error',
      isClosable: true
    })
  }
}

export const formatDateISO = (date: Date) => {
  const d = new Date(date)
  const month = ('' + (d.getMonth() + 1)).padStart(2, '0')
  const day = ('' + d.getDate()).padStart(2, '0')
  const year = d.getFullYear()
  return [year, month, day].join('-')
}

export const handleStartEndDateChange = (event, field, form) => {
  let targetValue = event.target.value
  if (event.target.value === '') {
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
