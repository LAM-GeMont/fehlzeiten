import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'
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
export class AbsenceResolver {
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
