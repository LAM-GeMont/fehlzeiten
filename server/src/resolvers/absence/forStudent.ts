import { Absence } from '../../entity/Absence'
import { Student } from '../../entity/Student'
import { Field, ObjectType, registerEnumType } from 'type-graphql'
import { Role } from '../../entity/User'
import { Context } from '../../types'

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

export async function absencesForStudent (studentId: string, context: Context) : Promise<AbsencesForStudentResponse> {
  try {
    if (context.req.user.role === Role.COORDINATOR) {
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
    }
    const absences = await Absence.find({
      join: {
        alias: 'absence',
        leftJoinAndSelect: {
          student: 'absence.student',
          user: 'absence.submittedBy'
        }
      },
      where: (qb: any) => {
        qb.where('user.id = :id', { id: context.req.user.id }).andWhere('student.id = :studentId', { studentId })
      }
    })
    if (absences.length < 1) {
      const student = await Student.findOne(studentId)
      if (student == null) {
        return {
          errors: [{
            code: AbsencesForStudentErrorCode.INVALID_STUDENT_ID
          }]
        }
      }
    }
    return { absences }
  } catch (error) {
    return {
      errors: [{
        code: AbsencesForStudentErrorCode.UNKNOWN_ERROR,
        message: error.message
      }]
    }
  }
}
