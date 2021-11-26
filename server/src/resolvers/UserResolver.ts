import { User } from '../entity/User'
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { registerUser, UserRegisterInput, UserRegisterResponse } from './user/register'
import { Context } from '../types'
import { loginUser, UserLoginResponse, UserLoginInput } from './user/login'

@Resolver(User)
export class UserResolver {
  @Authorized()
  @Query(() => [User])
  async users () {
    return await User.find()
  }

  @Authorized()
  @Query(() => User, { nullable: true })
  async self (
    @Ctx() context: Context
  ) {
    return context.req.user
  }

  @Authorized('COORDINATOR')
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
    return new Promise<void>((resolve) => {
      context.req.session.destroy(resolve)
    })
  }
}
