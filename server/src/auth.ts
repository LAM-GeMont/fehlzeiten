import { AuthChecker } from 'type-graphql'
import { Role, User } from './entity/User'
import { Context } from './types'

/**
 * Authorize the calling user. This method is called when an API endpoint
 * has an `@Authorized` decorator/annotation. It can have an argument like
 * `["TEACHER", "COORDINATOR"]`, which will be available in this method as
 * as the `roles` argument.
 */
export const authChecker: AuthChecker<Context> = async ({ context }, roles) => {
  // get the calling user from the context, i.e., check if it even exists
  const caller = await User.fromContext(context)
  if (caller == null) {
    return false
  }

  // user does exist, now check user's roles

  // no roles were specified in the decorator, so always allow
  if (roles.length === 0) {
    return true
  }

  // roles were specified in the decorator, so compare the user's roles to those roles
  const userRoleAsString = Role[caller.role]
  return roles.includes(userRoleAsString)
}
