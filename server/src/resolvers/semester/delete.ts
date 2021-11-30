import { Semester } from '../../entity/Semester'
import { registerEnumType, ObjectType, Field, InputType, ID } from 'type-graphql'

export enum SemesterDeleteErrorCode {
  UNKNOWN_ERROR,
  NOT_FOUND,
}

registerEnumType(SemesterDeleteErrorCode, {
  name: 'SemesterDeleteErrorCode'
})

@ObjectType()
export class SemesterDeleteError {
  @Field(() => SemesterDeleteErrorCode)
  code: SemesterDeleteErrorCode

  @Field({ nullable: true })
  message?: string
}

@ObjectType()
export class SemesterDeleteResponse {
  @Field(() => [SemesterDeleteError], { nullable: true })
  errors?: SemesterDeleteError[]
}

@InputType()
export class SemesterDeleteInput {
  @Field(() => ID!)
  id: string
}

export async function deleteSemester (data: SemesterDeleteInput): Promise<SemesterDeleteResponse> {
  try {
    const semester = await Semester.findOne(data.id)
    if (semester == null) {
      return {
        errors: [
          {
            code: SemesterDeleteErrorCode.NOT_FOUND
          }
        ]
      }
    }

    await semester.remove()

    return {
    }
  } catch (error) {
    return {
      errors: [
        {
          code: SemesterDeleteErrorCode.UNKNOWN_ERROR,
          message: error.message
        }
      ]
    }
  }
}
