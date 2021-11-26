import { Absence } from '../../entity/Absence'
import { Student } from '../../entity/Student'
import { Field, ObjectType, registerEnumType } from 'type-graphql'
import { Role } from '../../entity/User'
import { Context } from '../../types'

export enum AbsencesForStudentErrorCode {
  UNKNOWN_ERROR,
  INVALID_STUDENT_ID,
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

export async function absencesForStudent (studentId: string, context: Context) : Promise<AbsencesForStudentResponse> {
  try {
    const student = await Student.findOne(studentId, { relations: ['absences', 'tutorium'] })
    if (student == null) {
      return {
        errors: [{
          code: AbsencesForStudentErrorCode.INVALID_STUDENT_ID
        }]
      }
    }

    // Allow coordinators and the students tutor to access all absences
    if (context.req.user.role === Role.COORDINATOR || student.tutorium?.tutorId === context.req.user.id) {
      return {
        absences: student.absences
      }
    }

    // Other users see only the absences submitted by themselves
    return {
      absences: student.absences.filter(absence => absence.submittedById === context.req.user.id)
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
