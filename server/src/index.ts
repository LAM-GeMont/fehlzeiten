import 'reflect-metadata'
import { createConnection } from 'typeorm'

(async () => {
  const connection = await createConnection()
  console.log(connection)
})()
