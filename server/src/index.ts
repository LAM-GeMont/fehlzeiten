import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { buildSchema } from 'type-graphql'
import 'reflect-metadata'
import { createConnection } from 'typeorm'
import { PingResolver } from './resolvers/ping'
import cors from 'cors'

(async () => {
  const connection = await createConnection()
  console.log(connection)

  const app = express()

  const apollo = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PingResolver],
      validate: false
    })
  })

  await apollo.start()

  app.use(cors())

  apollo.applyMiddleware({ app, cors: false })

  app.listen(4000, () => {
    console.log('server started on localhost:4000')
  })
})()
