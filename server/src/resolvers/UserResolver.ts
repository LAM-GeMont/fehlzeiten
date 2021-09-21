import { User } from '../entity/User'
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { registerUser, UserRegisterInput, UserRegisterResponse } from './user/register'
import { Context } from '../types'
import { loginUser, UserLoginResponse, UserLoginInput } from './user/login'
import { self } from './user/self'
import { logoutUser } from './user/logout'

@Resolver(User)
export class UserResolver {
  @Query(() => [User])
  async users () {
    return await User.find()
  }

  @Query(() => User, { nullable: true })
  async self (
    @Ctx() context: Context
  ) {
    return self(context)
  }

  @Mutation(() => UserRegisterResponse)
  async registerUser (
    @Arg('data') data: UserRegisterInput,
    @Ctx() context: Context
  ) : Promise<UserRegisterResponse> {
    return registerUser(data, context)
  }

  @Mutation(() => UserLoginResponse)
  async loginUser (
    @Arg('data') data: UserLoginInput,
    @Ctx() context: Context
  ) : Promise<UserLoginResponse> {
    return loginUser(data, context)
  }

  @Mutation(() => Boolean, { nullable: true })
  async logoutUser (
    @Ctx() context: Context
  ) : Promise<void> {
    return logoutUser(context)
  }
}
