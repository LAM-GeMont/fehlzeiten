import Icon from "@chakra-ui/icon"
import { Center, LinkBox, LinkOverlay, Box } from "@chakra-ui/react"
import { IconType } from "react-icons";

interface Props {
    bgc: string,
    icon: IconType,
    href: string,
    text: string
}

export const LinkBoxHomePage: React.FC<Props> = (props) => {
    return (
        <LinkBox
            bg={props.bgc} color="white" width="inherit" height="inherit" fontSize="inherit"
            textAlign="center" borderRadius="25px"
        >
            <Center mt={[2, 4, 6, 8]}>
                <Box>
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