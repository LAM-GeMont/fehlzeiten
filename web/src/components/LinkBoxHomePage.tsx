import { Image, Center, LinkBox, LinkOverlay } from "@chakra-ui/react"

interface Props {
    bgc: string,
    src: string,
    height: string,
    alt: string,
    margTop: string,
    margBottom: string,
    href: string,
    text: string
}

export const LinkBoxHomePage: React.FC<Props> = (props) => {
    return (
        <LinkBox
            bg={props.bgc} color="white" width="325px" height="235px" fontSize="larger"
            textAlign="center" borderStyle="solid" borderWidth="thin" borderColor="black"
        >
            <Center marginTop={props.margTop}>
                <Image
                    objectFit="cover"
                    src={props.src}
                    height={props.height}
                    alt={props.alt}
                    marginBottom={props.margBottom}
                />
            </Center>
            <b>
                <LinkOverlay href={props.href}>
                    {props.text}
                </LinkOverlay>
            </b>
        </LinkBox>
    )
}