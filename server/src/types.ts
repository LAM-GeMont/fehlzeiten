import { Request, Response } from 'express'
import { Session } from 'express-session'

export type Context = {
  req: Request & { session: Session };
  res: Response
}

declare module 'express-session' {
  interface Session {
      userId: string
  }
}
