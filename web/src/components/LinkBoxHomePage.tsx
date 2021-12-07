import Icon from '@chakra-ui/icon'
import { Box, Link, Center, Divider, Text, LinkOverlay, LinkBox } from '@chakra-ui/layout'
import { IconType } from 'react-icons'
import NextLink from 'next/link'
import React from 'react'

interface Props {
    icon: IconType,
    url: string,
    text: string,
    isExternalLink: boolean
}

export const LinkBoxHomePage: React.FC<Props> = (props) => {
  const getNextLinks = () => {
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

  const getExternalLinks = () => {
    return (
      <LinkBox bg='#001955' color='white' width='inherit' height='inherit' textAlign='center' borderRadius='25px' cursor="pointer">
        <Center>
          <Box m={3}>
            <LinkOverlay href={props.url} title={props.text} _hover={{ textDecoration: 'none' }} isExternal>
              <Icon boxSize={{ base: 10, sm: 20, md: 20, lg: 24 }} as={props.icon}/>
              <Divider orientation='horizontal' borderStyle='unset'/>
              <Text mt={1}>{props.text}</Text>
            </LinkOverlay>
          </Box>
        </Center>
      </LinkBox>
    )
  }

  return (
    (props.isExternalLink) ? getExternalLinks() : getNextLinks()
  )
}
