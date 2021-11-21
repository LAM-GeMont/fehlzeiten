import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { Absence } from '../entity/Absence'
import { absencesForStudent, AbsencesForStudentResponse } from './absence/forStudent'
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
    @Arg('studentId') studentId: string
  ) {
    return absencesForStudent(studentId)
  }

  @Authorized()
  @Mutation(() => AbsencesCreateResponse)
  async createAbsences (
    @Arg('data') data: AbsencesCreateInput,
    @Ctx() context: Context
  ) : Promise<AbsencesCreateResponse> {
    return createAbsences(data, context)
  }
}
