import { Tutorium } from '../entity/Tutorium'
import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, ResolverInterface, Root } from 'type-graphql'
import { createTutorium, TutoriumCreateInput, TutoriumCreateResponse } from './tutorium/create'
import { TutoriumDeleteInput, TutoriumDeleteResponse, deleteTutorium } from './tutorium/delete'
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
    console.log(students.filter(student => student == null))
    return students
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
  @Mutation(() => TutoriumDeleteResponse)
  async deleteTutorium (
    @Arg('data') data: TutoriumDeleteInput
  ): Promise<TutoriumDeleteResponse> {
    return deleteTutorium(data)
  }
}
