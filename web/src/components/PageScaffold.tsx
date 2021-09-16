import Icon from '@chakra-ui/icon'
import { Box, Flex, Link } from '@chakra-ui/layout'
import React from 'react'
import { FaHome, FaUsers } from 'react-icons/fa'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

interface Props {
  
}

export const PageScaffold: React.FC<Props> = (props) => {

  const router = useRouter()

  const links = [
    {
      icon: FaHome,
      url: "/",
      title: "Home"
    },
    {
      icon: FaUsers,
      url: "/tutorium",
      title: "Tutorien"
    }
  ]

  return (
    <Box w="full" pos="relative">
      <Flex pos="absolute" left={24} top={0} padding={5}>
        {props.children}
      </Flex>
      <Flex w={24} h="100vh" boxShadow="md" pos="fixed" left={0} top={0} bg="white" direction="column" alignItems="center">
        {links.map(({icon, url, title}) => (
          <Box margin={4} _hover={{color: "primary.200"}} borderBottom="2px solid" borderBottomColor={router.pathname == url ? "primary.100" : "transparent"} >
            <NextLink href={url}>
              <Link title={title}>
                <Icon w={10} h={10} as={icon} />
              </Link>
            </NextLink>
          </Box>
        ))}
      </Flex>
    </Box>
  )
}
