import { Tutorium } from '../entity/Tutorium'
import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, ResolverInterface, Root } from 'type-graphql'
import { createTutorium, TutoriumCreateInput, TutoriumCreateResponse } from './tutorium/create'
import { editTutorium, TutoriumEditInput, TutoriumEditResponse } from './tutorium/edit'
import { deleteTutorium, TutoriumDeleteInput, TutoriumDeleteResponse } from './tutorium/delete'
import { deleteStudentFromTutorium, DeleteStudentFromTutoriumInput, DeleteStudentFromTutoriumResponse } from './tutorium/deleteStudentFromTutorium'
import { addStudentToTutorium, AddStudentToTutoriumInput, AddStudentToTutoriumResponse } from './tutorium/addStudentToTutorium'
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

  @Authorized('COORDINATOR')
  @Mutation(() => DeleteStudentFromTutoriumResponse)
  async deleteStudentFromTutorium (
      @Arg('data') data: DeleteStudentFromTutoriumInput
  ): Promise<DeleteStudentFromTutoriumResponse> {
    return deleteStudentFromTutorium(data)
  }

  @Authorized('COORDINATOR')
  @Mutation(() => AddStudentToTutoriumResponse)
  async addStudentToTutorium (
      @Arg('data') data: AddStudentToTutoriumInput
  ): Promise<AddStudentToTutoriumResponse> {
    return addStudentToTutorium(data)
  }
}
