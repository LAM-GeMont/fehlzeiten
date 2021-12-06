import Icon from '@chakra-ui/icon'
import { Box, Flex, Link } from '@chakra-ui/layout'
import React from 'react'
import { FaChalkboardTeacher, FaHome, FaSignOutAlt, FaUserGraduate, FaBook, FaCalendarWeek, FaFileImport } from 'react-icons/fa'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { Role } from '../generated/graphql'
import { IconType } from 'react-icons'
import { Text } from '@chakra-ui/react'

interface Props {
  role: Role
}

interface SidebarLink {
  icon: IconType,
  url: string,
  title: string,
  roles: Role[]
}

export const PageScaffold: React.FC<Props> = (props) => {
  const router = useRouter()

  const links: SidebarLink[] = [
    {
      icon: FaHome,
      url: '/',
      title: 'Home',
      roles: [Role.Teacher, Role.Coordinator]
    },
    {
      icon: FaChalkboardTeacher,
      url: '/tutorium',
      title: 'Tutorien',
      roles: [Role.Coordinator]
    },
    {
      icon: FaUserGraduate,
      url: '/student',
      title: 'Schüler',
      roles: [Role.Teacher, Role.Coordinator]
    },
    {
      icon: FaBook,
      url: '/absence',
      title: 'Fehlzeiten',
      roles: [Role.Teacher, Role.Coordinator]
    },
    {
      icon: FaCalendarWeek,
      url: '/semester',
      title: 'Zeitspannen',
      roles: [Role.Coordinator]
    },
    {
      icon: FaFileImport,
      url: '/studentsupload',
      title: 'Importieren',
      roles: [Role.Coordinator]
    }
  ]

  return (
    <Box w="full" pos="relative">
      <Flex marginLeft={{ base: '0', lg: '24' }} marginBottom={{ base: '16', lg: '0' }} padding={5} width={{ base: '100vw', lg: 'calc(100vw - 6rem)' }}>
        {props.children}
      </Flex>
      <Flex w={24} h="100vh" boxShadow="md" pos="fixed" left={0} top={0} bg="white" direction="column" alignItems="center" display={{ base: 'none', lg: 'flex' }}>
        {links.filter(({ roles }) => roles.includes(props.role)).map(({ icon, url, title }, key) => (
          <Box key={key} margin={4} _hover={{ color: 'primary.200' }} color={router.pathname === url ? 'primary.500' : '#000000'} >
            <NextLink href={url}>
              <Link title={title} display="flex" flexDir="column" alignItems="center" _hover={{ textDecoration: 'none' }}>
                <Icon w={8} h={8} as={icon}/>
                <Text fontSize={14}>{title}</Text>
              </Link>
            </NextLink>
          </Box>
        ))}
        <Box key="logout" margin={4} mt="auto" _hover={{ color: 'primary.200' }}>
          <NextLink href={'/logout'}>
            <Link title={'Logout'} display="flex" flexDir="column" alignItems="center" _hover={{ textDecoration: 'none' }}>
              <Icon w={8} h={8} as={FaSignOutAlt} />
              <Text fontSize={14}>Logout</Text>
            </Link>
          </NextLink>
        </Box>
      </Flex>
      <Box h="16" boxShadow="4px 0 6px -1px rgba(0, 0, 0, 0.1),2px 0 4px -1px rgba(0, 0, 0, 0.06)" pos="fixed" left={0} bottom={0} width="100vw" bg="white" display={{ base: 'flex', lg: 'none' }} overflowX="scroll" userSelect="none">
        <Flex direction="row" alignItems="center" justifyContent="space-evenly" flexShrink={0} minWidth="100%">
          {links.filter(({ roles }) => roles.includes(props.role)).map(({ icon, url, title }, key) => (
            <Box key={key} margin={2} mb={0} w={16} _hover={{ color: 'primary.200' }} color={router.pathname === url ? 'primary.500' : '#000000'} flexShrink={0}>
              <NextLink href={url}>
                <Link title={title} display="flex" flexDir="column" alignItems="center" _hover={{ textDecoration: 'none' }}>
                  <Icon w={7} h={7} as={icon} mb={1} />
                  <Text fontSize={14}>{title}</Text>
                </Link>
              </NextLink>
            </Box>
          ))}
          <Box key="logout" margin={2} mb={0} w={16} _hover={{ color: 'primary.200' }} flexShrink={0}>
            <NextLink href={'/logout'}>
              <Link title={'Logout'} display="flex" flexDir="column" alignItems="center" _hover={{ textDecoration: 'none' }}>
                <Icon w={7} h={7} as={FaSignOutAlt} mb={1} />
                <Text fontSize={14}>Logout</Text>
              </Link>
            </NextLink>
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}
