import { Tutorium } from '../../entity/Tutorium'
import { registerEnumType, ObjectType, Field, InputType, ID } from 'type-graphql'
import { User } from '../../entity/User'
import { Context } from '../../types'

export enum TutoriumDeleteErrorCode {
  UNKNOWN_ERROR,
  NOT_FOUND,
  UNAUTHORIZED
}

registerEnumType(TutoriumDeleteErrorCode, {
  name: 'TutoriumDeleteErrorCode'
})

@ObjectType()
export class TutoriumDeleteError {
  @Field(() => TutoriumDeleteErrorCode)
  code: TutoriumDeleteErrorCode

  @Field({ nullable: true })
  message?: string
}

@ObjectType()
export class TutoriumDeleteResponse {
  @Field(() => [TutoriumDeleteError], { nullable: true })
  errors?: TutoriumDeleteError[]
}

@InputType()
export class TutoriumDeleteInput {
  @Field(() => ID!)
  id: string
}

export async function deleteTutorium (data: TutoriumDeleteInput, context: Context): Promise<TutoriumDeleteResponse> {
  try {
    const caller = await User.fromContext(context)
    if (caller == null || !caller.isCoordinator) {
      return {
        errors: [{
          code: TutoriumDeleteErrorCode.UNAUTHORIZED
        }]
      }
    }

    const tutorium = await Tutorium.findOne(data.id)
    if (tutorium == null) {
      return {
        errors: [
          {
            code: TutoriumDeleteErrorCode.NOT_FOUND
          }
        ]
      }
    }

    await tutorium.remove()

    return {
    }
  } catch (error) {
    return {
      errors: [
        {
          code: TutoriumDeleteErrorCode.UNKNOWN_ERROR,
          message: error.message
        }
      ]
    }
  }
}
