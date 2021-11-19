import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { createAbsence, AbsenceCreateInput, AbsenceCreateResponse } from './absence/create'
// import { AbsenceDeleteInput, AbsenceDeleteResponse, deleteAbsence } from './absence/delete'
import { Context } from '../types'
import { Absence } from '../entity/Absence'

@Resolver(Absence)
export class AbsenceResolver {
  // @Query(() => [Absence])
  // async absences () {
  //   return await Absence.find()
  // }

  @Mutation(() => AbsenceCreateResponse)
  async createAbsence (
    @Arg('data') data: AbsenceCreateInput,
    @Ctx() context: Context
  ) : Promise<AbsenceCreateResponse> {
    return createAbsence(data, context)
  }

  // @Mutation(() => AbsenceDeleteResponse)
  // async deleteAbsence (
  //   @Arg('data') data: AbsenceDeleteInput,
  //   @Ctx() context: Context
  // ): Promise<AbsenceDeleteResponse> {
  //   return deleteAbsence(data, context)
  // }
}
