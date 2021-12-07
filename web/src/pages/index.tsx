import { Img, Text, Heading, Box, SimpleGrid, Flex } from '@chakra-ui/react'
import { FaBook, FaChalkboardTeacher, FaUserGraduate, FaQuestion, FaCalendarWeek } from 'react-icons/fa'
import { PageScaffold } from '../components/PageScaffold'
import WithAuth, { WithAuthProps } from '../components/withAuth'
import { LinkBoxHomePage } from '../components/LinkBoxHomePage'
import React from 'react'
import source from '../images/Logo_GeMont.png'
import { Role } from '../generated/graphql'
import { IconType } from 'react-icons'

interface BoxLink {
  icon: IconType,
  url: string,
  text: string,
  isExternalLink: boolean
  roles: Role[]
}

const Index: React.FC<WithAuthProps> = ({ self }) => {
  const arrayOfLinkBoxes: BoxLink[] = [
    {
      icon: FaChalkboardTeacher,
      url: '/tutorium',
      text: 'Tutorium Management',
      isExternalLink: false,
      roles: [Role.Teacher, Role.Coordinator]
    },
    {
      icon: FaUserGraduate,
      url: '/student',
      text: 'Schüler Management',
      isExternalLink: false,
      roles: [Role.Teacher, Role.Coordinator]
    },
    {
      icon: FaBook,
      url: '/absence',
      text: 'Abwesenheit buchen',
      isExternalLink: false,
      roles: [Role.Teacher, Role.Coordinator]
    },
    {
      icon: FaCalendarWeek,
      url: '/semester',
      text: 'Zeitspanne erstellen',
      isExternalLink: false,
      roles: [Role.Coordinator]
    },
    {
      icon: FaQuestion,
      url: 'https://lam-gemont.github.io/fehlzeiten/',
      text: 'Support',
      isExternalLink: true,
      roles: [Role.Teacher, Role.Coordinator]
    }
  ]

  const getLinkBoxes = () => {
    return (
      <>
        {arrayOfLinkBoxes.filter(({ roles }) => roles.includes(self.role)).map(({ icon, url, text, isExternalLink }, key) => (
          <LinkBoxHomePage key={key} icon={icon} url={url} text={text} isExternalLink={isExternalLink}/>
        ))}
      </>
    )
  }

  return (
    <PageScaffold role={self.role}>
      <Box w='full' >
        <Box>
          <Flex direction={['column', 'column']} alignItems='center'>
            <Box>
              <Img
                objectFit='cover'
                max-width='100%'
                height='auto'
                src={source.src}
                alt='GeMont-Logo'
              />
            </Box>
            <Box>
              <Heading
                as='h1'
                fontSize={{ base: '24px', sm: '40px', md: '40px', lg: '56px' }}
                fontWeight='extrabold'
                textAlign='center'
                wordBreak='break-word'
              >
                Erfassung von Fehlzeiten
              </Heading>
            </Box>
          </Flex>
        </Box>
        <Box w='full' marginTop='10'>
          <Text
            fontSize={{ base: '16px', sm: '24px', md: '24px', lg: '40px' }}
            fontWeight='extrabold'
            textAlign='center'
            color='#333333'
          >
            Willkommen {self.name}
          </Text>
        </Box>
        <Box marginTop={{ base: '10', sm: '16', md: '16', lg: '28' }}>
          <SimpleGrid minChildWidth={{ base: '120px', sm: '175px', md: '175px', lg: '200px' }} height='auto' spacing={{ base: '16px', sm: '20px', md: '20px', lg: '30px' }} wordBreak='break-word'>
            {getLinkBoxes()}
          </SimpleGrid>
        </Box>
      </Box>
    </PageScaffold>
  )
}

export default WithAuth(Index)
