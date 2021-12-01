import Icon from '@chakra-ui/icon'
import { Box, Link, Center } from '@chakra-ui/layout'
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
    <Box bg='#001955' color='white' width='inherit' height='inherit' textAlign='center' borderRadius='25px'>
      <Center>
        <Box m={3}>
          <NextLink href={props.url}>
            <Link title={props.text}>
              <Icon boxSize={{ base: 10, sm: 20, md: 20, lg: 24 }} as={props.icon}></Icon>
            </Link>
          </NextLink>
        </Box>
      </Center>
    </Box>
  )
}
