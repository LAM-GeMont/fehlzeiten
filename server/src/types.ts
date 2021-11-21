import { Request, Response } from 'express'
import { Session } from 'express-session'
import { User } from './entity/User'

export type Context = {
  req: Request & { session: Session, user: User };
  res: Response
}

declare module 'express-session' {
  interface Session {
      userId: string
  }
}
