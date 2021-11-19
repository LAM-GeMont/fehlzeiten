import { Absence } from '../../entity/Absence'
import { Field, ID, InputType, Int, ObjectType, registerEnumType } from 'type-graphql'
import { Context } from '../../types'
import { User } from '../../entity/User'
import { Student } from '../../entity/Student'

export enum AbsenceCreateErrorCode {
  UNKNOWN_ERROR,
  UNAUTHORIZED,
  INVALID_STUDENT_ID
}

registerEnumType(AbsenceCreateErrorCode, {
  name: 'AbsenceCreateErrorCode'
})

@ObjectType()
export class AbsenceCreateError {
  @Field(() => AbsenceCreateErrorCode)
  code: AbsenceCreateErrorCode

  @Field({ nullable: true })
  message?: string
}

@ObjectType()
export class AbsenceCreateResponse {
  @Field(() => Absence, { nullable: true })
  absence?: Absence

  @Field(() => [AbsenceCreateError], { nullable: true })
  errors?: AbsenceCreateError[]
}

@InputType()
export class AbsenceCreateInput {
  @Field(() => ID)
  studentId: string

  @Field(() => Int)
  lessonIndex: number

  @Field()
  date: string
}

export async function createAbsence (args: AbsenceCreateInput, context: Context) : Promise<AbsenceCreateResponse> {
  try {
    const caller = await User.fromContext(context)
    if (caller == null) {
      return {
        errors: [{
          code: AbsenceCreateErrorCode.UNAUTHORIZED
        }]
      }
    }

    const student = await Student.findOne(args.studentId)
    if (student == null) {
      return {
        errors: [{
          code: AbsenceCreateErrorCode.INVALID_STUDENT_ID
        }]
      }
    }

    const absence = new Absence()
    absence.student = student
    absence.lessonIndex = args.lessonIndex
    absence.date = args.date
    await absence.save()

    return {
      absence
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
