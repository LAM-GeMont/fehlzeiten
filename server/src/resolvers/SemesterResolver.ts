import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql'
import { Semester } from '../entity/Semester'
import {
  SemesterCreateInput,
  SemesterCreateResponse,
  createSemester
} from './semester/create'
import {
  deleteSemester,
  SemesterDeleteInput,
  SemesterDeleteResponse
} from './semester/delete'

@Resolver(Semester)
export class SemesterResolver {
  @Authorized()
  @Query(() => [Semester])
  async semesters () {
    return await Semester.find()
  }

  @Authorized(['COORDINATOR'])
  @Mutation(() => SemesterCreateResponse)
  async createSemester (
    @Arg('data') data: SemesterCreateInput
  ) : Promise<SemesterCreateResponse> {
    return createSemester(data)
  }

  @Authorized(['COORDINATOR'])
  @Mutation(() => SemesterDeleteResponse)
  async deleteSemester (
    @Arg('data') data: SemesterDeleteInput
  ) : Promise<SemesterDeleteResponse> {
    return deleteSemester(data)
  }
}
