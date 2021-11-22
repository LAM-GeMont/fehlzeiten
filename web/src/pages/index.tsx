import {
  Flex, Spacer, Image, Text, Heading, GridItem,
  Grid, Box, SimpleGrid, Divider, Container, Center,
  LinkBox, LinkOverlay
} from "@chakra-ui/react"
import { PageScaffold } from '../components/PageScaffold'
import WithAuth, { WithAuthProps } from '../components/withAuth'

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
            <LinkBox
              bg="#56CCF2" color="white" width="325px" height="235px" fontSize="larger"
              textAlign="center" borderStyle="solid" borderWidth="thin" borderColor="black"
            >
              <Center marginTop="4">
                <Image
                  objectFit="cover"
                  src="https://i.ibb.co/BjYJF0L/Tutor.png"
                  height="44"
                  alt="Tutor-Bild"
                />
              </Center>
              <b>
                <LinkOverlay href="/tutorium">
                  Tutorium Management
                </LinkOverlay>
              </b>
            </LinkBox>
            <LinkBox
              bg="#FC912A" color="white" width="325px" height="235px" fontSize="larger"
              textAlign="center" borderStyle="solid" borderWidth="thin" borderColor="black"
            >
              <Center marginTop="4">
                <Image
                  objectFit="cover"
                  src="https://i.ibb.co/rtsrGTx/Sch-ler.png"
                  height="44"
                  alt="Schüler-Bild"
                />
              </Center>
              <b>
                <LinkOverlay href="/">
                  Schüler Management
                </LinkOverlay>
              </b>
            </LinkBox>
            <LinkBox
              bg="#94E43B" color="white" width="325px" height="235px" fontSize="larger"
              textAlign="center" borderStyle="solid" borderWidth="thin" borderColor="black"
            >
              <Center marginTop="4">
                <Image
                  objectFit="cover"
                  src="https://i.ibb.co/GPvKhRF/Abwesenheit-buchen.png"
                  alt="Abwesenheit-Bild"
                  height="44"
                />
              </Center>
              <b>
                <LinkOverlay href="/">
                  Abwesenheit buchen
                </LinkOverlay>
              </b>
            </LinkBox>
            <LinkBox
              bg="#9B51E0" color="white" width="325px" height="235px" fontSize="larger"
              textAlign="center" borderStyle="solid" borderWidth="thin" borderColor="black"
            >
              <Center >
                <Image
                  objectFit="cover"
                  src="https://i.ibb.co/dDWNbHf/Support.png"
                  height="48"
                  alt="Support-Bild"
                  marginBottom="-0.5"
                />
              </Center>
              <b>
                <LinkOverlay href="/">
                  Support
                </LinkOverlay>
              </b>
            </LinkBox>
          </SimpleGrid>
        </Box>
      </Box>
    </PageScaffold>
  )
}

export default WithAuth(Index)