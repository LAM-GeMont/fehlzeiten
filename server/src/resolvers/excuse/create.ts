import { Excuse } from '../../entity/Excuse'
import { Field, ID, InputType, Int, ObjectType, registerEnumType } from 'type-graphql'
import { Context } from '../../types'
import { Student } from '../../entity/Student'

export enum ExcuseCreateErrorCode {
  UNKNOWN_ERROR,
  INVALID_STUDENT_ID,
  INVALID_START_DATE,
  INVALID_END_DATE,
  INVALID_LESSON_AMOUNT,
  INVALID_LESSON_DATE_COMBINATION
}

registerEnumType(ExcuseCreateErrorCode, {
  name: 'ExcuseCreateErrorCode'
})

@ObjectType()
export class ExcuseCreateError {
  @Field(() => ExcuseCreateErrorCode)
  code: ExcuseCreateErrorCode

  @Field({ nullable: true })
  message?: string
}

@ObjectType()
export class ExcuseCreateResponse {
  @Field(() => Excuse, { nullable: true })
  excuse?: Excuse

  @Field(() => [ExcuseCreateError], { nullable: true })
  errors?: ExcuseCreateError[]
}

@InputType()
export class ExcuseCreateInput {
  @Field(() => ID)
  studentId: string

  @Field()
  startDate: string

  @Field()
  endDate: string

  @Field(() => [Int], { nullable: true })
  lessons?: number[]
}

export async function createExcuse (args: ExcuseCreateInput, { caller }: Context) : Promise<ExcuseCreateResponse> {
  try {
    const isoDateRegex = /\d{4}-\d{2}-\d{2}/
    const startDateCanBeParsedAsDate = isNaN(Date.parse(args.startDate))
    if (!isoDateRegex.test(args.startDate) || startDateCanBeParsedAsDate) {
      return {
        errors: [{
          code: ExcuseCreateErrorCode.INVALID_START_DATE
        }]
      }
    }
    const endDateCanBeParsedAsDate = isNaN(Date.parse(args.endDate))
    if (!isoDateRegex.test(args.endDate) || endDateCanBeParsedAsDate) {
      return {
        errors: [{
          code: ExcuseCreateErrorCode.INVALID_END_DATE
        }]
      }
    }
    const student = await Student.findOne(args.studentId)
    if (student == null) {
      return {
        errors: [{
          code: ExcuseCreateErrorCode.INVALID_STUDENT_ID
        }]
      }
    }
    if (args.lessons != null) {
      if (args.startDate !== args.endDate) {
        return {
          errors: [{
            code: ExcuseCreateErrorCode.INVALID_LESSON_DATE_COMBINATION
          }]
        }
      }
      if (args.lessons.length < 1) {
        return {
          errors: [{
            code: ExcuseCreateErrorCode.INVALID_LESSON_AMOUNT
          }]
        }
      }
    }
    const excuse = new Excuse()
    excuse.startDate = args.startDate
    excuse.endDate = args.endDate
    excuse.student = student
    excuse.lessons = args.lessons
    excuse.submittedBy = caller
    await excuse.save()
    return { excuse }
  } catch (error) {
    return {
      errors: [{
        code: ExcuseCreateErrorCode.UNKNOWN_ERROR,
        message: error.message
      }]
    }
  }
}
