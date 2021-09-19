import { User } from '../../entity/User'
import { Context } from '../../types'

export async function self ({ req }: Context) {
  return User.findOne(req.session.userId)
}
