import { Tutorium } from '../../entity/Tutorium'
import { Field, InputType, ObjectType, registerEnumType } from 'type-graphql'
import { User } from '../../entity/User'

export enum TutoriumCreateErrorCode {
  UNKNOWN_ERROR,
  NAME_TOO_SHORT,
  TUTOR_NOT_VALID,
  DUPLICATE_NAME
}

registerEnumType(TutoriumCreateErrorCode, {
  name: 'TutoriumCreateErrorCode'
})

@ObjectType()
export class TutoriumCreateError {
  @Field(() => TutoriumCreateErrorCode)
  code: TutoriumCreateErrorCode

  @Field({ nullable: true })
  message?: string
}

@ObjectType()
export class TutoriumCreateResponse {
  @Field(() => Tutorium, { nullable: true })
  tutorium?: Tutorium

  @Field(() => [TutoriumCreateError], { nullable: true })
  errors?: TutoriumCreateError[]
}

@InputType()
export class TutoriumCreateInput {
  @Field()
  name: string

  @Field({ nullable: true })
  tutorId?: string
}

export async function createTutorium (args: TutoriumCreateInput) : Promise<TutoriumCreateResponse> {
  try {
    if (args.name.length < 1) {
      return {
        errors: [{
          code: TutoriumCreateErrorCode.NAME_TOO_SHORT,
          message: 'Must be altleast 1'
        }]
      }
    }

    const tutorium = new Tutorium()
    tutorium.name = args.name

    if (args.tutorId != null && args.tutorId !== '') {
      const tutor = await User.findOne(args.tutorId)

      if (tutor == null) {
        return {
          errors: [
            {
              code: TutoriumCreateErrorCode.TUTOR_NOT_VALID,
              message: 'The provided Tutor is not valid'
            }
          ]
        }
      }
      tutorium.tutor = tutor
    }

    await tutorium.save()

    return {
      tutorium
    }
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return {
        errors: [{
          code: TutoriumCreateErrorCode.DUPLICATE_NAME,
          message: error.message
        }]
      }
    }
    return {
      errors: [{
        code: TutoriumCreateErrorCode.UNKNOWN_ERROR,
        message: error.message
      }]
    }
  }
}
