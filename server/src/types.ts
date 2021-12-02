import { Request, Response } from 'express'
import { Session } from 'express-session'
import { Tutorium } from './entity/Tutorium'
import { User } from './entity/User'
import DataLoader from 'dataloader'
import { Absence } from './entity/Absence'
import { Student } from './entity/Student'
import { Excuse } from './entity/Excuse'
import { Semester } from './entity/Semester'

export type Context = {
  req: Request & { session: Session }
  res: Response
  caller?: User
  loaders: {
    absence: DataLoader<string, Absence>
    excuse: DataLoader<string, Excuse>
    student: DataLoader<string, Student>
    tutorium: DataLoader<string, Tutorium>
    user: DataLoader<string, User>
    semester: DataLoader<string, Semester>
    studentExcuses: DataLoader<string, Excuse[]>
    studentAbsences: DataLoader<string, Absence[]>
  }
}

declare module 'express-session' {
  interface Session {
      userId: string
  }
}
