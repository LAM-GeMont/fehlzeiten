import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { buildSchema } from 'type-graphql'
import 'reflect-metadata'
import { createConnection, getRepository } from 'typeorm'
import cors from 'cors'
import { TutoriumResolver } from './resolvers/TutoriumResolver.js'
import { Tutorium } from './entity/Tutorium.js'
import { User } from './entity/User.js'
import { UserResolver } from './resolvers/UserResolver.js'
import session from 'express-session'
import { COOKIE_NAME, __PROD__ } from './constants'
import { TypeormStore } from 'connect-typeorm/out'
import env from 'dotenv-safe'
import path from 'path'
import { Session } from './entity/Session.js'
import { Student } from './entity/Student.js'
import { StudentResolver } from './resolvers/StudentResolver.js'
import { Absence } from './entity/Absence.js'
import { AbsenceResolver } from './resolvers/AbsenceResolver.js'
import { authChecker } from './auth.js'
import { Excuse } from './entity/Excuse'
import { ExcuseResolver } from './resolvers/ExcuseResolver'
import { createAbsenceLoader, createExcuseLoader, createSemesterLoader, createStudentExcuseLoader, createStudentLoader, createTutoriumLoader, createUserLoader } from './loaders'
import { Context } from './types.js'
import { SemesterResolver } from './resolvers/SemesterResolver'
import { Semester } from './entity/Semester'

env.config({ path: path.resolve(process.cwd(), '..', '.env'), example: path.resolve(process.cwd(), '..', '.env.example') });

(async () => {
  await createConnection({
    type: 'better-sqlite3',
    database: './db.db',
    synchronize: true,
    logging: true,
    entities: [Absence, Excuse, Semester, Session, Student, Tutorium, User]
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

  const loaders = {
    absence: createAbsenceLoader(),
    excuse: createExcuseLoader(),
    student: createStudentLoader(),
    tutorium: createTutoriumLoader(),
    user: createUserLoader(),
    semester: createSemesterLoader(),
    studentExcuses: createStudentExcuseLoader()
  }

  const apollo = new ApolloServer({
    schema: await buildSchema({
      resolvers: [AbsenceResolver, ExcuseResolver, SemesterResolver, StudentResolver, TutoriumResolver, UserResolver],
      validate: false,
      authChecker: authChecker
    }),
    context: async ({ req, res }): Promise<Context> => {
      return {
        req,
        res,
        caller: req.session.userId != null ? await loaders.user.load(req.session.userId) : undefined,
        loaders
      }
    }
  })

  await apollo.start()

  app.use(cors({
    credentials: true,
    origin: ['https://studio.apollographql.com', 'http://localhost:3000']
  }))

  apollo.applyMiddleware({ app, cors: false })

  app.listen(process.env.PORT, () => {
    console.log('server started on localhost:' + process.env.PORT)
  })
})()
