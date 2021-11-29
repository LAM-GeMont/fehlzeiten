import { User } from '../entity/User'
import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, ResolverInterface, Root } from 'type-graphql'
import { registerUser, UserRegisterInput, UserRegisterResponse } from './user/register'
import { Context } from '../types'
import { loginUser, UserLoginResponse, UserLoginInput } from './user/login'
import { Tutorium } from '../entity/Tutorium'
import { Absence } from '../entity/Absence'
import { Excuse } from '../entity/Excuse'

@Resolver(User)
export class UserResolver implements ResolverInterface<User> {
  @Authorized()
  @FieldResolver()
  async tutoriums (@Root() user: User) {
    return Tutorium.find({ where: { tutorId: user.id } })
  }

  @Authorized()
  @FieldResolver()
  async submittedAbsences (@Root() user: User, @Ctx() { caller }: Context) {
    if (caller == null) { return [] }

    if (caller.id !== user.id) {
      return []
    }

    return Absence.find({ where: { submittedById: user.id } })
  }

  @Authorized()
  @FieldResolver()
  async submittedExcuses (@Root() user: User, @Ctx() { caller }: Context) {
    if (caller == null) { return [] }

    if (caller.id !== user.id) {
      return []
    }

    return Excuse.find({ where: { submittedById: user.id } })
  }

  @Authorized()
  @Query(() => [User])
  async users () {
    return await User.find()
  }

  @Authorized()
  @Query(() => User, { nullable: true })
  async self (
    @Ctx() { caller }: Context
  ) {
    return caller
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
