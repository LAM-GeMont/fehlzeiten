import Icon from '@chakra-ui/icon'
import { Box, Link, Center, Divider, Text } from '@chakra-ui/layout'
import { IconType } from 'react-icons'
import NextLink from 'next/link'
import React from 'react'

interface Props {
    icon: IconType,
    url: string,
    text: string
}

export const LinkBoxHomePage: React.FC<Props> = (props) => {
  return (
    <NextLink href={props.url}>
      <Box bg='#001955' color='white' width='inherit' height='inherit' textAlign='center' borderRadius='25px' cursor="pointer">
        <Center>
          <Box m={3}>
            <Link title={props.text} _hover={{ textDecoration: 'none' }}>
              <Icon boxSize={{ base: 10, sm: 20, md: 20, lg: 24 }} as={props.icon}/>
              <Divider orientation='horizontal' borderStyle='unset'/>
              <Text mt={1}>{props.text}</Text>
            </Link>
          </Box>
        </Center>
      </Box>
    </NextLink>
  )
}
