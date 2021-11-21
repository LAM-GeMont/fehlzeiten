import { Absence } from '../../entity/Absence'
import { Student } from '../../entity/Student'
import { Field, ObjectType, registerEnumType } from 'type-graphql'

export enum AbsencesForStudentErrorCode {
  UNKNOWN_ERROR,
  INVALID_STUDENT_ID,
  UNAUTHORIZED
}

registerEnumType(AbsencesForStudentErrorCode, {
  name: 'AbsencesForStudentErrorCode'
})

@ObjectType()
export class AbsencesForStudentError {
  @Field(() => AbsencesForStudentErrorCode)
  code: AbsencesForStudentErrorCode

  @Field({ nullable: true })
  message?: string
}

@ObjectType()
export class AbsencesForStudentResponse {
  @Field(() => [Absence], { nullable: true })
  absences?: Absence[]

  @Field(() => [AbsencesForStudentError], { nullable: true })
  errors?: AbsencesForStudentError[]
}

export async function absencesForStudent (studentId: string) : Promise<AbsencesForStudentResponse> {
  try {
    const student = await Student.findOne(studentId, { relations: ['absences'] })
    if (student == null) {
      return {
        errors: [{
          code: AbsencesForStudentErrorCode.INVALID_STUDENT_ID
        }]
      }
    }

    return {
      absences: student.absences
    }
  } catch (error) {
    return {
      errors: [{
        code: AbsencesForStudentErrorCode.UNKNOWN_ERROR,
        message: error.message
      }]
    }
  }
}
