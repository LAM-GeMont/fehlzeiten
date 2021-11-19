import { Absence } from '../../entity/Absence'
import { Student } from '../../entity/Student'
import { Field, ObjectType, registerEnumType } from 'type-graphql'

export enum AbsencesForUserErrorCode {
  UNKNOWN_ERROR,
  INVALID_STUDENT_ID,
  UNAUTHORIZED
}

registerEnumType(AbsencesForUserErrorCode, {
  name: 'AbsencesForUserErrorCode'
})

@ObjectType()
export class AbsencesForUserError {
  @Field(() => AbsencesForUserErrorCode)
  code: AbsencesForUserErrorCode

  @Field({ nullable: true })
  message?: string
}

@ObjectType()
export class AbsencesForUserResponse {
  @Field(() => [Absence], { nullable: true })
  absences?: Absence[]

  @Field(() => [AbsencesForUserError], { nullable: true })
  errors?: AbsencesForUserError[]
}

export async function absencesForUser (studentId: string) : Promise<AbsencesForUserResponse> {
  try {
    const student = await Student.findOne(studentId, { relations: ['absences'] })
    if (student == null) {
      return {
        errors: [{
          code: AbsencesForUserErrorCode.INVALID_STUDENT_ID
        }]
      }
    }

    return {
      absences: student.absences
    }
  } catch (error) {
    return {
      errors: [{
        code: AbsencesForUserErrorCode.UNKNOWN_ERROR,
        message: error.message
      }]
    }
  }
}
