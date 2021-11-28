import { Image, Text, Heading, Box, SimpleGrid, Stack, Center, Flex } from '@chakra-ui/react'
import { FaBook, FaChalkboardTeacher, FaUserGraduate, FaQuestion } from 'react-icons/fa'
import { PageScaffold } from '../components/PageScaffold'
import WithAuth, { WithAuthProps } from '../components/withAuth'
import { LinkBoxHomePage } from '../components/LinkBoxHomePage'
import React from 'react'

const Index: React.FC<WithAuthProps> = ({ self }) => {
  const getTeacherLinkBoxes = () => {
    return (
      <>
        <LinkBoxHomePage
          icon={FaUserGraduate}
          href='/student'
          text='Schüler Management'
        />
        <LinkBoxHomePage
          icon={FaBook}
          href='/absence'
          text='Abwesenheit buchen'
        />
        <LinkBoxHomePage
          icon={FaQuestion}
          href='/'
          text='Support'
        />
      </>
    )
  }

  const getLinkBoxes = (userRole) => {
    if (userRole === 'COORDINATOR') {
      return (
        <SimpleGrid minChildWidth={{ base: '125px', sm: '225px', md: '225px', lg: '325px' }} height='auto' spacing={{ base: '16px', sm: '24px', md: '24px', lg: '40px' }} fontSize={{ base: '16px', sm: '24px', md: '24px', lg: '36px' }} wordBreak='break-word'>
          <LinkBoxHomePage icon={FaChalkboardTeacher} href='/tutorium' text='Tutorium Management'/>
          {getTeacherLinkBoxes()}
        </SimpleGrid>
      )
    }

    if (userRole === 'TEACHER') {
      return (
        // different layout, buttons are smaller --> maybe it is better???
        <Center>
          <Stack 
            direction={['column', 'row']}
            spacing={{ base: '16px', sm: '24px', md: '24px', lg: '40px' }}
            minChildWidth='inherit'
            height='inherit'
            fontSize='inherit'
          >
            {getTeacherLinkBoxes()}
          </Stack>
        </Center>
      )
    }
  }

  return (
    <PageScaffold role={self.role}>
      <Box w='full' >
        <Box>
          <Flex direction={['column', 'column']} alignItems='center'>
            <Box>
              <Image
                objectFit='cover'
                max-width='100%'
                height='auto'
                src='https://image.jimcdn.com/app/cms/image/transf/none/path/se04d54dd5603e862/image/id9085589dffdbb35/version/1516615343/image.png'
                alt='GeMont-Logo'
              />
            </Box>
            <Box>
              <Heading
                as='h1'
                fontSize={{ base: '24px', sm: '40px', md: '40px', lg: '56px' }}
                fontWeight='extrabold'
                textAlign='center'
                color=''
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
            Willkommen &apos;Username&apos;
          </Text>
        </Box>
        <Box marginTop={{ base: '10', sm: '16', md: '16', lg: '28' }}>
          {getLinkBoxes(self.role)}
        </Box>
      </Box>
    </PageScaffold>
  )
}

export default WithAuth(Index)
