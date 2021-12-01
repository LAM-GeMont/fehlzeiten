import { Field, InputType, ObjectType, registerEnumType } from 'type-graphql'
import { Semester } from '../../entity/Semester'

export enum SemesterCreateErrorCode {
  UNKNOWN_ERROR,
  UNAUTHORIZED,
  INVALID_START_DATE,
  INVALID_END_DATE,
  NEGATIVE_LENGTH,
  NAME_TOO_SHORT,
  DUPLICATE_NAME
}

registerEnumType(SemesterCreateErrorCode, {
  name: 'SemesterCreateErrorCode'
})

@ObjectType()
export class SemesterCreateError {
  @Field(() => SemesterCreateErrorCode)
  code: SemesterCreateErrorCode

  @Field({ nullable: true })
  message?: string
}

@ObjectType()
export class SemesterCreateResponse {
  @Field(() => Semester, { nullable: true })
  semester?: Semester

  @Field(() => [SemesterCreateError], { nullable: true })
  errors?: SemesterCreateError[]
}

@InputType()
export class SemesterCreateInput {
  @Field()
  startDate: string

  @Field()
  endDate: string

  @Field()
  name: string
}

export async function createSemester (args: SemesterCreateInput) : Promise<SemesterCreateResponse> {
  try {
    const isoDateRegex = /\d{4}-\d{2}-\d{2}/
    const startDateAsMillis = Date.parse(args.startDate)
    const endDateAsMillis = Date.parse(args.endDate)
    if (!isoDateRegex.test(args.startDate) || isNaN(startDateAsMillis)) {
      return {
        errors: [{
          code: SemesterCreateErrorCode.INVALID_START_DATE
        }]
      }
    }
    if (!isoDateRegex.test(args.endDate) || isNaN(endDateAsMillis)) {
      return {
        errors: [{
          code: SemesterCreateErrorCode.INVALID_END_DATE
        }]
      }
    }
    if (endDateAsMillis < startDateAsMillis) {
      return {
        errors: [{
          code: SemesterCreateErrorCode.NEGATIVE_LENGTH,
          message: 'End date must be after start date'
        }]
      }
    }

    if (args.name.length < 1) {
      return {
        errors: [{
          code: SemesterCreateErrorCode.NAME_TOO_SHORT,
          message: 'Name must contain at least one character'
        }]
      }
    }

    const semester = new Semester()
    semester.startDate = args.startDate
    semester.endDate = args.endDate
    semester.name = args.name
    await semester.save()

    return {
      semester
    }
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return {
        errors: [{
          code: SemesterCreateErrorCode.DUPLICATE_NAME,
          message: error.message
        }]
      }
    }
    return {
      errors: [{
        code: SemesterCreateErrorCode.UNKNOWN_ERROR,
        message: error.message
      }]
    }
  }
}
