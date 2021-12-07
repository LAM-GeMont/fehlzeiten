import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, ResolverInterface, Root } from 'type-graphql'
import { Excuse } from '../entity/Excuse'
import { Context } from '../types'
import {
  ExcuseCreateInput,
  ExcuseCreateResponse,
  createExcuse
} from './excuse/create'
import { ExcuseDeleteResponse, ExcuseDeleteInput, deleteExcuse } from './excuse/delete'

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
  @Query(() => Excuse, { nullable: true })
  async excuse (
    @Arg('id') id: string,
    @Ctx() { loaders }: Context
  ) {
    return loaders.excuse.load(id)
  }

  @Authorized()
  @Mutation(() => ExcuseCreateResponse)
  async createExcuse (
    @Arg('data') data: ExcuseCreateInput,
    @Ctx() context: Context
  ) : Promise<ExcuseCreateResponse> {
    return createExcuse(data, context)
  }

  @Authorized()
  @Mutation(() => ExcuseDeleteResponse)
  async deleteExcuse (
    @Arg('data') data: ExcuseDeleteInput
  ) : Promise<ExcuseDeleteResponse> {
    return deleteExcuse(data)
  }
}
