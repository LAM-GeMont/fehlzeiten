import { Flex } from '@chakra-ui/layout'
import React from 'react'

interface Props {
  
}

export const PageScaffold: React.FC<Props> = (props) => {
  return (
    <Flex w="full">
      {props.children}
    </Flex>
  )
}
