import { User } from '../../entity/User'
import { Context } from '../../types'

export async function self (context: Context) {
  return User.fromContext(context)
}
