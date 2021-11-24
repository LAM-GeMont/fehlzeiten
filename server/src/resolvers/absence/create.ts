import { Absence } from '../../entity/Absence'
import { Field, ID, InputType, Int, ObjectType, registerEnumType } from 'type-graphql'
import { Context } from '../../types'
import { Student } from '../../entity/Student'

export enum AbsenceCreateErrorCode {
  UNKNOWN_ERROR,
  UNAUTHORIZED,
  INVALID_STUDENT_ID,
  INVALID_DATE
}

registerEnumType(AbsenceCreateErrorCode, {
  name: 'AbsenceCreateErrorCode'
})

@ObjectType()
export class AbsencesCreateError {
  @Field(() => AbsenceCreateErrorCode)
  code: AbsenceCreateErrorCode

  @Field({ nullable: true })
  message?: string

  @Field(() => ID, { nullable: true })
  studentId?: string
}

@ObjectType()
export class AbsencesCreateResponse {
  @Field(() => [Absence], { nullable: true })
  absences?: Absence[]

  @Field(() => [AbsencesCreateError], { nullable: true })
  errors?: AbsencesCreateError[]
}

@InputType()
export class AbsencesCreateInput {
  @Field(() => [ID])
  studentIds: string[]

  @Field(() => [Int])
  lessonIndexes: number[]

  @Field()
  date: string

  @Field()
  exam: boolean
}

export async function createAbsences (args: AbsencesCreateInput, context: Context) : Promise<AbsencesCreateResponse> {
  try {
    const isoDateRegex = /\d{4}-\d{2}-\d{2}/
    const canBeParsedAsDate = isNaN(Date.parse(args.date))
    if (!isoDateRegex.test(args.date) || canBeParsedAsDate) {
      return {
        errors: [{
          code: AbsenceCreateErrorCode.INVALID_DATE
        }]
      }
    }
    const absences: Absence[] = []
    const errors: AbsencesCreateError[] = []
    for (const studentId of args.studentIds) {
      const student = await Student.findOne(studentId)
      if (student == null) {
        errors.push({
          code: AbsenceCreateErrorCode.INVALID_STUDENT_ID
        })
        continue
      }
      for (const lessonIndex of args.lessonIndexes) {
        const absence = new Absence()
        absence.student = student
        absence.lessonIndex = lessonIndex
        absence.date = args.date
        absence.exam = args.exam
        absence.submittedBy = context.req.user
        try {
          await absence.save()
          absences.push(absence)
        } catch (error) {
          errors.push({
            code: AbsenceCreateErrorCode.UNKNOWN_ERROR,
            message: error.message
          })
        }
      }
    }
    return {
      absences: absences.length > 0 ? absences : undefined,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (error) {
    return {
      errors: [{
        code: AbsenceCreateErrorCode.UNKNOWN_ERROR,
        message: error.message
      }]
    }
  }
}
