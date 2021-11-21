import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { createAbsence, AbsenceCreateInput, AbsenceCreateResponse } from './absence/create'
import { Absence } from '../entity/Absence'
import { absencesForStudent, AbsencesForStudentResponse } from './absence/forStudent'
import { Context } from '../types'

@Resolver(Absence)
export class AbsenceResolver {
  @Authorized()
  @Query(() => AbsencesForStudentResponse)
  async absencesForStudent (
    @Arg('studentId') studentId: string
  ) {
    return absencesForStudent(studentId)
  }

  @Authorized()
  @Mutation(() => AbsenceCreateResponse)
  async createAbsence (
    @Arg('data') data: AbsenceCreateInput,
    @Ctx() context: Context
  ) : Promise<AbsenceCreateResponse> {
    return createAbsence(data, context)
  }
}
