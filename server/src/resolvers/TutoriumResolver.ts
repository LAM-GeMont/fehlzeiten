import { Tutorium } from '../entity/Tutorium'
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { createTutorium, TutoriumCreateInput, TutoriumCreateResponse } from './tutorium/create'
import { TutoriumDeleteInput, TutoriumDeleteResponse, deleteTutorium } from './tutorium/delete'
import { Context } from '../types'

@Resolver(Tutorium)
export class TutoriumResolver {
  @Query(() => [Tutorium])
  async tutoriums () {
    return await Tutorium.find()
  }

  @Mutation(() => TutoriumCreateResponse)
  async createTutorium (
    @Arg('data') data: TutoriumCreateInput,
    @Ctx() context: Context
  ) : Promise<TutoriumCreateResponse> {
    return createTutorium(data, context)
  }

  @Mutation(() => TutoriumDeleteResponse)
  async deleteTutorium (
    @Arg('data') data: TutoriumDeleteInput,
    @Ctx() context: Context
  ): Promise<TutoriumDeleteResponse> {
    return deleteTutorium(data, context)
  }
}
