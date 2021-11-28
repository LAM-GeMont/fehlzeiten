import Icon from '@chakra-ui/icon'
import { Center, LinkBox, LinkOverlay, Box } from '@chakra-ui/react'
import { IconType } from 'react-icons'
import React from 'react'

interface Props {
    icon: IconType,
    href: string,
    text: string
}

export const LinkBoxHomePage: React.FC<Props> = (props) => {
  return (
    <LinkBox
      bg='#001955' color='white' width='inherit' height='inherit' fontSize='inherit'
      textAlign='center' borderRadius='25px' 
    >
      <Center>
        <Box m={4}>
          <Icon boxSize={{ base: 24, sm: 36, md: 36, lg: 40 }} as={props.icon}> 
          </Icon>
            <Box>
              <b>
                <LinkOverlay href={props.href}>
                  {props.text}
                </LinkOverlay>
              </b>
            </Box>
        </Box>
      </Center>
    </LinkBox>
  )
}
