import { Tutorium } from '../entity/Tutorium'
import {Arg, Authorized, FieldResolver, Mutation, Query, Resolver, Root} from 'type-graphql'
import { createTutorium, TutoriumCreateInput, TutoriumCreateResponse } from './tutorium/create'
import { editTutorium, TutoriumEditInput, TutoriumEditResponse } from './tutorium/edit'
import { deleteTutorium, TutoriumDeleteInput, TutoriumDeleteResponse } from './tutorium/delete'
import { User } from "../entity/User";

@Resolver(Tutorium)
export class TutoriumResolver {
  @Authorized()
  @FieldResolver()
  async tutor (@Root() tutorium: Tutorium) {
    return await User.findOne({ where: { id: tutorium.tutorId } })
  }

  @Authorized()
  @Query(() => [Tutorium])
  async tutoriums () {
    return await Tutorium.find({relations: ['tutor']})
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
