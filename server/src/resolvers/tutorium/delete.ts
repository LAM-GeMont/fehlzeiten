/* eslint-disable no-undef */
import { Tutorium } from '../../entity/Tutorium'
import { registerEnumType, ObjectType, Field, InputType, ID } from 'type-graphql'

export enum TutoriumDeleteErrorCode {
  UNKNOWN_ERROR,
  NOT_FOUND
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
  @Field(() => Tutorium, { nullable: true })
  tutorium?: Tutorium

  @Field(() => [TutoriumDeleteError], { nullable: true })
  errors?: TutoriumDeleteError[]
}

@InputType()
export class TutoriumDeleteInput {
  @Field(() => ID!)
  id: string
}

export async function deleteTutorium (data: TutoriumDeleteInput): Promise<TutoriumDeleteResponse> {
  try {
    console.log('TEST')
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

    console.log('TEST')
    console.log(tutorium)
    await tutorium.remove()
    console.log(tutorium)

    return {
      tutorium
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
