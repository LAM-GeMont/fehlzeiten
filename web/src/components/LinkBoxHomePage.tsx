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
            bg={props.bgc} color="white" width="325px" height="235px" fontSize="x-large"
            textAlign="center" borderRadius="25px"
        >
            <Center marginTop={3}>
                <Box>
                    <Icon w={44} h={44} as={props.icon}></Icon>
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