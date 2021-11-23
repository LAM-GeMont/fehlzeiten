import { Image, Text, Heading, Box, SimpleGrid, Stack, Center } from "@chakra-ui/react"
import { GiTeacher } from "react-icons/gi"
import { IoIosPeople } from "react-icons/io"
import { FaAddressBook } from "react-icons/fa"
import { BiSupport } from "react-icons/bi"
import { PageScaffold } from '../components/PageScaffold'
import WithAuth, { WithAuthProps } from '../components/withAuth'
import { LinkBoxHomePage } from "../components/LinkBoxHomePage";

const Index: React.FC<WithAuthProps> = ({ self }) => {

  const TeacherLinkBoxes = () => {
    return (
      <>
        <LinkBoxHomePage
          bgc="#94E43B"
          icon={FaAddressBook}
          href="/"
          text="Abwesenheit buchen"
        />
        <LinkBoxHomePage
          bgc="#9B51E0"
          icon={BiSupport}
          href="/"
          text="Support"
        />
      </>
    );
  }

  const getLinkBoxes = (userRole) => {
    if (userRole === "COORDINATOR") {
      return (
        <SimpleGrid minChildWidth="325px" spacing="40px">
          <LinkBoxHomePage
            bgc="#56CCF2"
            icon={GiTeacher}
            href="/tutorium"
            text="Tutorium Management"
          />
          <LinkBoxHomePage
            bgc="#FC912A"
            icon={IoIosPeople}
            href="/"
            text="Schüler Management"
          />
          {TeacherLinkBoxes()}
        </SimpleGrid>
      );
    }

    if (userRole === "TEACHER") {
      return (
        <Center>
          <Stack direction={["column", "row"]} spacing="40px">
            {TeacherLinkBoxes()}
          </Stack>
        </Center>
      );
    }
  }

  return (
    <PageScaffold role={self.role}>
      <Box w="full" right={0}>
        <Box>
          <SimpleGrid columns={[2, null, 3]} spacing="40px">
            <Image
              objectFit="cover"
              src="https://image.jimcdn.com/app/cms/image/transf/none/path/se04d54dd5603e862/image/id9085589dffdbb35/version/1516615343/image.png"
              alt="GeMont-Logo"
            />
            <Heading
              as="h1"
              fontSize="6xl"
              fontWeight="extrabold"
              textAlign="center"
              color=""
              wordBreak="break-word"
            >
              Erfassung von Fehlzeiten
            </Heading>
          </SimpleGrid>
        </Box>
        <Box w="full" marginTop="10">
          <Text
            fontSize="xx-large"
            fontWeight="extrabold"
            textAlign="center"
            color="#333333"
          >
            Willkommen "Username"
          </Text>
        </Box>
        <Box marginTop="36" marginLeft="24" marginRight="24">
          {getLinkBoxes(self.role)}
        </Box>
      </Box>
    </PageScaffold>
  )
}

export default WithAuth(Index)