import Icon from '@chakra-ui/icon'
import { Center, LinkBox, LinkOverlay, Box, Text } from '@chakra-ui/react'
import { IconType } from 'react-icons'
import React from 'react'

interface Props {
    icon: IconType,
    href: string,
    text: string
}

export const LinkBoxHomePage: React.FC<Props> = (props) => {
  return (
    <LinkBox bg='#001955' color='white' width='inherit' height='inherit' textAlign='center' borderRadius='25px'>
      <Center>
        <Box m={3}>
          <Icon boxSize={{ base: 10, sm: 20, md: 20, lg: 24 }} as={props.icon}></Icon>
          <Box>
            <Text fontWeight={{ sm: 'bold', md: 'bold', lg: 'bold' }} marginTop='1'>
              <LinkOverlay href={props.href}>
                {props.text}
              </LinkOverlay>
            </Text>
          </Box>
        </Box>
      </Center>
    </LinkBox>
  )
}
