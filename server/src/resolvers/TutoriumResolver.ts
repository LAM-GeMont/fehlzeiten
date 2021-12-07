import { Tutorium } from '../entity/Tutorium'
import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, ResolverInterface, Root } from 'type-graphql'
import { createTutorium, TutoriumCreateInput, TutoriumCreateResponse } from './tutorium/create'
import { editTutorium, TutoriumEditInput, TutoriumEditResponse } from './tutorium/edit'
import { deleteTutorium, TutoriumDeleteInput, TutoriumDeleteResponse } from './tutorium/delete'
import { Context } from 'vm'
import { Student } from '../entity/Student'

@Resolver(Tutorium)
export class TutoriumResolver implements ResolverInterface<Tutorium> {
  @Authorized()
  @FieldResolver()
  async tutor (@Root() tutorium: Tutorium, @Ctx() { loaders }: Context) {
    if (tutorium.tutorId == null) {
      return undefined
    }

    return loaders.user.load(tutorium.tutorId)
  }

  @Authorized()
  @FieldResolver()
  async students (@Root() tutorium: Tutorium) {
    const students = await Student.find({ where: { tutoriumId: tutorium.id } })
    return students
  }

  @Authorized()
  @Query(() => Tutorium, { nullable: true })
  async tutorium (
    @Arg('id') id: string,
    @Ctx() { loaders }: Context
  ) {
    return loaders.tutorium.load(id)
  }

  @Authorized()
  @Query(() => [Tutorium])
  async tutoriums () {
    return await Tutorium.find()
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
