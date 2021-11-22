import { Image, Text, Heading, Box, SimpleGrid } from "@chakra-ui/react"
import { PageScaffold } from '../components/PageScaffold'
import WithAuth, { WithAuthProps } from '../components/withAuth'
import { LinkBoxHomePage } from "../components/LinkBoxHomePage";

const Index: React.FC<WithAuthProps> = ({ self }) => {

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
          <SimpleGrid minChildWidth="325px" spacing="40px">
            <LinkBoxHomePage bgc="#56CCF2" src="https://i.ibb.co/BjYJF0L/Tutor.png"  height="44"
              alt="Tutor-Bild" margTop="4" margBottom="unset" href="/tutorium"
              text="Tutorium Management"/>
            <LinkBoxHomePage bgc="#FC912A" src="https://i.ibb.co/rtsrGTx/Sch-ler.png"  height="44"
              alt="Schüler-Bild" margTop="4" margBottom="unset" href="/"
              text="Schüler Management"/>
            <LinkBoxHomePage bgc="#94E43B" src="https://i.ibb.co/GPvKhRF/Abwesenheit-buchen.png"  height="44"
              alt="Abwesenheit-Bild" margTop="4" margBottom="unset" href="/"
              text="Abwesenheit buchen"/>
            <LinkBoxHomePage bgc="#9B51E0" src="https://i.ibb.co/dDWNbHf/Support.png"  height="48"
              alt="Support-Bild" margTop="unset" margBottom="-0.5" href="/"
              text="Support"/>
          </SimpleGrid>
        </Box>
      </Box>
    </PageScaffold>
  )
}

export default WithAuth(Index)