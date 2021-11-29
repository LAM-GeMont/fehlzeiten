import { Absence } from '../../entity/Absence'
import { Field, ID, InputType, Int, ObjectType, registerEnumType } from 'type-graphql'
import { Context } from '../../types'
import { Student } from '../../entity/Student'

export enum AbsenceCreateErrorCode {
  UNKNOWN_ERROR,
  INVALID_STUDENT_ID,
  INVALID_DATE,
  ABSENCE_ALREADY_EXISTS,
  ABSENCE_POTENTIAL_UPGRADE
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

  @Field(() => ID, { nullable: true })
  studentName?: string

  @Field(() => Int, { nullable: true })
  lessonIndex?: number

  @Field({ nullable: true })
  date?: string
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

  @Field()
  overwriteOnDuplicate: boolean
}

export async function createAbsences (args: AbsencesCreateInput, { caller }: Context) : Promise<AbsencesCreateResponse> {
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
    const potentialExamUpgrade = []
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
        absence.submittedBy = caller
        try {
          await absence.save()
          absences.push(absence)
        } catch (error) {
          if (error.message.includes('UNIQUE')) {
            if (args.overwriteOnDuplicate) {
              await Absence.update({ studentId: student.id, lessonIndex, date: args.date }, { exam: true })
            } else {
              if (args.exam) {
                potentialExamUpgrade.push({ error, studentId: student.id, lessonIndex, date: args.date })
              } else {
                errors.push({
                  code: AbsenceCreateErrorCode.ABSENCE_ALREADY_EXISTS,
                  message: error.message,
                  studentId: student.id
                })
              }
            }
          } else {
            errors.push({
              code: AbsenceCreateErrorCode.UNKNOWN_ERROR,
              message: error.message
            })
          }
        }
      }
    }
    if (potentialExamUpgrade.length > 0) {
      console.log(potentialExamUpgrade)
      const absences = await Absence.find({
        where: potentialExamUpgrade.map(v => { return { studentId: v.studentId, date: v.date, lessonIndex: v.lessonIndex } })
      })
      for (const absence of absences) {
        if (absence.exam) {
          errors.push({
            code: AbsenceCreateErrorCode.ABSENCE_ALREADY_EXISTS,
            studentId: absence.studentId
          })
        } else {
          errors.push({
            code: AbsenceCreateErrorCode.ABSENCE_POTENTIAL_UPGRADE,
            studentId: absence.studentId,
            lessonIndex: absence.lessonIndex,
            date: absence.date
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
