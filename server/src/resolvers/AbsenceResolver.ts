import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, ResolverInterface, Root } from 'type-graphql'
import { Absence } from '../entity/Absence'
import { absencesForStudent, AbsencesForStudentResponse } from './absence/forStudent'
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
  @Query(() => AbsencesForStudentResponse)
  async absencesForStudent (
    @Arg('studentId') studentId: string,
    @Ctx() context: Context
  ) {
    return absencesForStudent(studentId, context)
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
