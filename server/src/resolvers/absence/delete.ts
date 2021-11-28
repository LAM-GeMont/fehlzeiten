import { Absence } from '../../entity/Absence'
import { registerEnumType, ObjectType, Field, InputType, ID } from 'type-graphql'

export enum AbsenceDeleteErrorCode {
  UNKNOWN_ERROR,
  NOT_FOUND,
}

registerEnumType(AbsenceDeleteErrorCode, {
  name: 'AbsenceDeleteErrorCode'
})

@ObjectType()
export class AbsenceDeleteError {
  @Field(() => AbsenceDeleteErrorCode)
  code: AbsenceDeleteErrorCode

  @Field({ nullable: true })
  message?: string
}

@ObjectType()
export class AbsenceDeleteResponse {
  @Field(() => [AbsenceDeleteError], { nullable: true })
  errors?: AbsenceDeleteError[]
}

@InputType()
export class AbsenceDeleteInput {
  @Field(() => ID!)
  id: string
}

export async function deleteAbsence (data: AbsenceDeleteInput): Promise<AbsenceDeleteResponse> {
  try {
    const absence = await Absence.findOne(data.id)
    if (absence == null) {
      return {
        errors: [
          {
            code: AbsenceDeleteErrorCode.NOT_FOUND
          }
        ]
      }
    }

    await absence.remove()

    return {
    }
  } catch (error) {
    return {
      errors: [
        {
          code: AbsenceDeleteErrorCode.UNKNOWN_ERROR,
          message: error.message
        }
      ]
    }
  }
}
