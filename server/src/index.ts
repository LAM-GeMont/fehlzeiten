import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { buildSchema } from 'type-graphql'
import 'reflect-metadata'
import { createConnection, getRepository } from 'typeorm'
import cors from 'cors'
import { TutoriumResolver } from './resolvers/TutoriumResolver.js'
import { Tutorium } from './entity/Tutorium.js'
import { Role, User } from './entity/User.js'
import { UserResolver } from './resolvers/UserResolver.js'
import session from 'express-session'
import { __PROD__, COOKIE_NAME } from './constants'
import { TypeormStore } from 'connect-typeorm/out'
import env from 'dotenv-safe'
import path from 'path'
import { Session } from './entity/Session.js'
import { StudentResolver } from './resolvers/StudentResolver.js'
import { Student } from './entity/Student.js'
import passport from 'passport'
import fs from 'fs'
import https from 'https'
import { deserializeUser, oauthStrategy, serializeUser } from './oauth'

env.config({
  path: path.resolve(process.cwd(), '..', '.env'),
  example: path.resolve(process.cwd(), '..', '.env.example')
});

(async () => {
  await createConnection({
    type: 'better-sqlite3',
    database: './db.db',
    synchronize: true,
    logging: true,
    entities: [Tutorium, User, Session, Student]
  })

  const app = express()

  app.use(session({
    name: COOKIE_NAME,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new TypeormStore().connect(getRepository(Session)),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
      httpOnly: true,
      secure: __PROD__,
      sameSite: 'none'
    }
  }))

  // OAUTH 2

  const key = fs.readFileSync(path.join(__dirname, '/cert/localhost-key.pem'))
  const cert = fs.readFileSync(path.join(__dirname, '/cert/localhost.pem'))

  const server = https.createServer({ key: key, cert: cert }, app)

  app.use(passport.initialize())
  app.use(passport.session())

  passport.use('oauth2', oauthStrategy)

  passport.serializeUser(async (user: any, done: any) => serializeUser(user, done))

  passport.deserializeUser(async (id: string, done: any) => deserializeUser(id, done))

  app.get('/api/login', passport.authenticate('oauth2'))

  app.get('/api/callback', passport.authenticate('oauth2'), (req: express.Request, res: express.Response) => {
    // @ts-ignore is valid
    req.session.userId = req.session.passport.user

    res.redirect('http://localhost:3000')
  })

  // END OAUTH 2

  const apollo = new ApolloServer({
    schema: await buildSchema({
      resolvers: [TutoriumResolver, UserResolver, StudentResolver],
      validate: false
    }),
    context: ({ req, res }) => ({
      req,
      res
    })
  })

  await apollo.start()

  app.use(cors({
    credentials: true,
    origin: ['https://studio.apollographql.com', 'http://localhost:3000']
  }))

  apollo.applyMiddleware({ app, cors: false })

  server.listen(process.env.PORT, () => {
    console.log('server started on localhost:' + process.env.PORT)
  })
})()
