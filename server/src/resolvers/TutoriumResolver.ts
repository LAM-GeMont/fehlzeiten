import { Tutorium } from '../entity/Tutorium'
import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql'
import { createTutorium, TutoriumCreateInput, TutoriumCreateResponse } from './tutorium/create'
import { editTutorium, TutoriumEditInput, TutoriumEditResponse } from './tutorium/edit'
import { TutoriumDeleteInput, TutoriumDeleteResponse, deleteTutorium } from './tutorium/delete'

@Resolver(Tutorium)
export class TutoriumResolver {
  @Authorized()
  @Query(() => [Tutorium])
  async tutoriums () {
    return await Tutorium.find({ relations: ['tutor'] })
  }

  @Authorized('COORDINATOR')
  @Mutation(() => TutoriumCreateResponse)
  async createTutorium (
    @Arg('data') data: TutoriumCreateInput
  ) : Promise<TutoriumCreateResponse> {
    return createTutorium(data)
  }

  @Authorized('COORDINATOR')
  @Mutation(() => TutoriumEditResponse)
  async editTutorium (
      @Arg('data') data: TutoriumEditInput
  ): Promise<TutoriumEditResponse> {
    return editTutorium(data)
  }

  @Authorized('COORDINATOR')
  @Mutation(() => TutoriumDeleteResponse)
  async deleteTutorium (
    @Arg('data') data: TutoriumDeleteInput
  ): Promise<TutoriumDeleteResponse> {
    return deleteTutorium(data)
  }
}
