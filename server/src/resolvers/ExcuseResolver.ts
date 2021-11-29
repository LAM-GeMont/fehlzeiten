import { Arg, Authorized, Ctx, FieldResolver, Mutation, Resolver, ResolverInterface, Root } from 'type-graphql'
import { Excuse } from '../entity/Excuse'
import { Context } from '../types'
import {
  ExcuseCreateInput,
  ExcuseCreateResponse,
  createExcuse
} from './excuse/create'

@Resolver(Excuse)
export class ExcuseResolver implements ResolverInterface<Excuse> {
  @Authorized()
  @FieldResolver()
  async student (@Root() excuse: Excuse, @Ctx() { loaders }: Context) {
    return loaders.student.load(excuse.studentId)
  }

  @Authorized()
  @FieldResolver()
  async submittedBy (@Root() excuse: Excuse, @Ctx() { loaders }: Context) {
    if (excuse.submittedById == null) {
      return undefined
    }
    return loaders.user.load(excuse.submittedById)
  }

  @Authorized()
  @Mutation(() => ExcuseCreateResponse)
  async createExcuse (
    @Arg('data') data: ExcuseCreateInput,
    @Ctx() context: Context
  ) : Promise<ExcuseCreateResponse> {
    return createExcuse(data, context)
  }
}
