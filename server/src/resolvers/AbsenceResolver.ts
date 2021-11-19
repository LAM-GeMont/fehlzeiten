import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql'
import { createAbsence, AbsenceCreateInput, AbsenceCreateResponse } from './absence/create'
import { Absence } from '../entity/Absence'
import { absencesForUser, AbsencesForUserResponse } from './absence/forUser'

@Resolver(Absence)
export class AbsenceResolver {
  @Authorized()
  @Query(() => AbsencesForUserResponse)
  async absencesForUser (
    @Arg('studentId') studentId: string
  ) {
    return absencesForUser(studentId)
  }

  @Authorized()
  @Mutation(() => AbsenceCreateResponse)
  async createAbsence (
    @Arg('data') data: AbsenceCreateInput
  ) : Promise<AbsenceCreateResponse> {
    return createAbsence(data)
  }
}
