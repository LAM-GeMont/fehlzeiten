import { Tutorium } from '../../entity/Tutorium'
import { Field, InputType, ObjectType, registerEnumType } from 'type-graphql'
import { Context } from '../../types'
import { User } from '../../entity/User'

export enum TutoriumCreateErrorCode {
  UNKNOWN_ERROR,
  UNAUTHORIZED,
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

  //self added:
  @Field()
  tutorId: string
}

export async function createTutorium (args: TutoriumCreateInput, context: Context) : Promise<TutoriumCreateResponse> {
  try {
    const caller = await User.fromContext(context)
    if (caller == null || !caller.isCoordinator) {
      return {
        errors: [{
          code: TutoriumCreateErrorCode.UNAUTHORIZED
        }]
      }
    }

    if (args.name.length < 1) {
      return {
        errors: [{
          code: TutoriumCreateErrorCode.NAME_TOO_SHORT,
          message: 'Must be altleast 1'
        }]
      }
    }

    //self added:
    if (args.tutorId.length < 1) {
      return {
        errors: [{
          code: TutoriumCreateErrorCode.TUTOR_NOT_VALID,
          message: 'The provided Tutor is not valid'
        }]
      }
    }

    const tutorium = new Tutorium()
    tutorium.name = args.name
    const tutor = await User.findOne(args.tutorId)//set Tutor via ID

    if(tutor?.hasId){
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
