import { Tutorium } from '../entity/Tutorium'
import { Arg, Mutation, Query, Resolver } from 'type-graphql'
import { createTutorium, TutoriumCreateInput, TutoriumCreateResponse } from './tutorium/create'
import { TutoriumDeleteInput, TutoriumDeleteResponse, deleteTutorium } from './tutorium/delete'

@Resolver(Tutorium)
export class TutoriumResolver {
  @Query(() => [Tutorium])
  async tutoriums () {
    return await Tutorium.find()
  }

  @Mutation(() => TutoriumCreateResponse)
  async createTutorium (
    @Arg('data') data: TutoriumCreateInput
  ) : Promise<TutoriumCreateResponse> {
    return createTutorium(data)
  }

  @Mutation(() => TutoriumDeleteResponse)
  async deleteTutorium (
    @Arg('data') data: TutoriumDeleteInput
  ): Promise<TutoriumDeleteResponse> {
    console.log('TEST')
    return deleteTutorium(data)
  }
}
