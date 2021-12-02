import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, ResolverInterface, Root } from 'type-graphql'
import { Absence } from '../entity/Absence'
import { AbsenceDeleteInput, AbsenceDeleteResponse, deleteAbsence } from './absence/delete'
import { Context } from '../types'
import {
  AbsencesCreateInput,
  AbsencesCreateResponse,
  createAbsences
} from './absence/create'

@Resolver(Absence)
export class AbsenceResolver implements ResolverInterface<Absence> {
  @Authorized()
  @FieldResolver()
  async student (@Root() absence: Absence, @Ctx() { loaders }: Context) {
    return loaders.student.load(absence.studentId)
  }

  @Authorized()
  @FieldResolver()
  async submittedBy (@Root() absence: Absence, @Ctx() { loaders }: Context) {
    if (absence.submittedById == null) {
      return undefined
    }
    return loaders.user.load(absence.submittedById)
  }

  @Authorized()
  @FieldResolver()
  async excused (@Root() absence: Absence, @Ctx() { loaders }: Context) {
    const excuses = await loaders.studentExcuses.load(absence.studentId)
    loaders.studentExcuses.clear(absence.studentId)

    return excuses.some(excuse => {
      if (excuse.startDate > absence.date || excuse.endDate < absence.date) {
        return false
      }

      if (absence.exam && !excuse.validForExam) {
        return false
      }

      if (excuse.lessons != null) {
        return excuse.lessons.includes(absence.lessonIndex)
      }

      return true
    })
  }

  @Authorized()
  @Query(() => Absence, { nullable: true })
  async absence (
    @Arg('id') id: string,
    @Ctx() { loaders }: Context
  ) {
    return loaders.absence.load(id)
  }

  @Authorized()
  @Mutation(() => AbsencesCreateResponse)
  async createAbsences (
    @Arg('data') data: AbsencesCreateInput,
    @Ctx() context: Context
  ) : Promise<AbsencesCreateResponse> {
    return createAbsences(data, context)
  }

  @Authorized('COORDINATOR')
  @Mutation(() => AbsenceDeleteResponse)
  async deleteAbsence (
    @Arg('data') data: AbsenceDeleteInput
  ): Promise<AbsenceDeleteResponse> {
    return deleteAbsence(data)
  }
}
