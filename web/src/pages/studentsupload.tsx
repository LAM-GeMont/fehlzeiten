import { Box, SimpleGrid, Text } from '@chakra-ui/layout'
import React, { useRef, useState } from 'react'
import { Input, Button } from '@chakra-ui/react'
import { PageScaffold } from '../components/PageScaffold'
import WithAuth, { WithAuthProps } from '../components/withAuth'
import { Role } from '../generated/graphql'

interface Props extends WithAuthProps {}

interface CsvEntry {
  firstName: string,
  lastName: string,
  tutorium: string
}

const Studentsupload: React.FC<Props> = ({ self }) => {
  const [csvLines, setCsvLines] = useState([])

  const handleChange = (event) => {
    const filePath = event.target.files[0]
    if ((filePath != null) && (filePath.type === 'application/vnd.ms-excel')) {
      const reader = new FileReader()
      reader.readAsText(filePath)
      filePath.text().then(text => {
        const lines: string[] = text.split('\r\n')
        const header: string[] = lines[0].split(';')
        if (header[0].trim() === 'Name' && header[1].trim() === 'Vorname' && header[2].trim() === 'Klasse') {
          lines.shift()
          const entries: CsvEntry[] = []
          lines.forEach((line) => {
            const elements: string[] = line.split(';')
            const entry: CsvEntry = {
              firstName: elements[1].trim(),
              lastName: elements[0].trim(),
              tutorium: elements[2].trim()
            }
            entries.push(entry)
          })
          console.log(header)
          console.log(entries)
          setCsvLines(entries)
        }
      })
    }
  }

  const fileInput = useRef(null)

  return (
    <PageScaffold role={self.role}>
      <SimpleGrid>
        <Text mb={2} fontSize="30" fontWeight="bold">Schüler importieren</Text>
        <Text>Zum importieren wird eine .csv Datei in mit den Schülern und der Kopfzeile:</Text>
        <Text mb={2} mt={2} ml={3} as="i" fontWeight="bold">Name; Nachname; Klasse</Text>
        <Text>benötigt. </Text>
        <Input style={{ display: 'none' }} type="file" onChange={handleChange} ref={fileInput}></Input>
        <Button bg='#001955' color='white' mt={2} onClick={ () => fileInput.current.click()}>.CSV Datei hochladen</Button>
        {csvLines.length > 0 && (
          <Text>Datei hochgeladen</Text>
        )}
      </SimpleGrid>
    </PageScaffold>
  )
}

export default WithAuth(Studentsupload, { roles: [Role.Coordinator] })
