import { Excuse } from '../../entity/Excuse'
import { registerEnumType, ObjectType, Field, InputType, ID } from 'type-graphql'

export enum ExcuseDeleteErrorCode {
  UNKNOWN_ERROR,
  NOT_FOUND,
}

registerEnumType(ExcuseDeleteErrorCode, {
  name: 'ExcuseDeleteErrorCode'
})

@ObjectType()
export class ExcuseDeleteError {
  @Field(() => ExcuseDeleteErrorCode)
  code: ExcuseDeleteErrorCode

  @Field({ nullable: true })
  message?: string
}

@ObjectType()
export class ExcuseDeleteResponse {
  @Field(() => [ExcuseDeleteError], { nullable: true })
  errors?: ExcuseDeleteError[]
}

@InputType()
export class ExcuseDeleteInput {
  @Field(() => ID!)
  id: string
}

export async function deleteExcuse (data: ExcuseDeleteInput): Promise<ExcuseDeleteResponse> {
  try {
    const excuse = await Excuse.findOne(data.id)
    if (excuse == null) {
      return {
        errors: [
          {
            code: ExcuseDeleteErrorCode.NOT_FOUND
          }
        ]
      }
    }

    await excuse.remove()

    return {
    }
  } catch (error) {
    return {
      errors: [
        {
          code: ExcuseDeleteErrorCode.UNKNOWN_ERROR,
          message: error.message
        }
      ]
    }
  }
}
