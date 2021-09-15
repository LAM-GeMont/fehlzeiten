import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { buildSchema } from 'type-graphql'
import 'reflect-metadata'
import { createConnection } from 'typeorm'
import cors from 'cors'
import { TutoriumResolver } from './resolvers/TutoriumResolver.js'
import { Tutorium } from './entity/Tutorium.js'

(async () => {
  await createConnection({
    type: 'better-sqlite3',
    database: './db.db',
    synchronize: true,
    logging: true,
    entities: [Tutorium]
  })

  for (let i = 1; i < 7; i++) {
    const tut = new Tutorium()
    tut.name = `12/${i}`
    tut.save()
  }

  const app = express()

  const apollo = new ApolloServer({
    schema: await buildSchema({
      resolvers: [TutoriumResolver],
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
