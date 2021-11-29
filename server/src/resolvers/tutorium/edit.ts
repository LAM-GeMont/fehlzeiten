import { Field, ID, InputType, ObjectType, registerEnumType } from 'type-graphql'
import { Tutorium } from '../../entity/Tutorium'
import { User } from '../../entity/User'
import { Not } from 'typeorm'

export enum TutoriumEditErrorCode {
    UNKNOWN_ERROR,
    NOT_FOUND,
    NAME_TOO_SHORT,
    DUPLICATE_NAME,
    TUTOR_NOT_FOUND
}

registerEnumType(TutoriumEditErrorCode, {
  name: 'TutoriumEditErrorCode'
})

@ObjectType()
export class TutoriumEditError {
    @Field(() => TutoriumEditErrorCode)
    code: TutoriumEditErrorCode

    @Field({ nullable: true })
    message?: string
}

@ObjectType()
export class TutoriumEditResponse {
    @Field(() => Tutorium, { nullable: true })
    tutorium?: Tutorium

    @Field(() => [TutoriumEditError], { nullable: true })
    errors?: TutoriumEditError[]
}

@InputType()
export class TutoriumEditInput {
    @Field(() => ID!)
    id: string

    @Field({ nullable: true })
    name?: string

    @Field({ nullable: true })
    tutor?: string
}

export async function editTutorium (data: TutoriumEditInput): Promise<TutoriumEditResponse> {
  try {
    const tutorium = await Tutorium.findOne(data.id)
    if (tutorium == null) {
      return {
        errors: [{
          code: TutoriumEditErrorCode.NOT_FOUND
        }]
      }
    }

    if (data.name != null) {
      if (data.name.length > 0) {
        tutorium.name = data.name
      } else {
        return {
          errors: [{
            code: TutoriumEditErrorCode.NAME_TOO_SHORT,
            message: 'Tutorium name must be at least 1'
          }]
        }
      }
    }

    const existingTutoriums = await Tutorium.find({ where: { name: tutorium.name, id: Not(tutorium.id) } })
    console.log(existingTutoriums)
    if (existingTutoriums.length > 0) {
      return {
        errors: [{
          code: TutoriumEditErrorCode.DUPLICATE_NAME,
          message: `A Tutorium with the name ${tutorium.name} already exists`
        }]
      }
    }

    if (data.tutor == null || data.tutor === '') {
      tutorium.tutor = null
    }

    if (data.tutor !== undefined && data.tutor !== '') {
      const tutor = await User.findOne(data.tutor)
      if (tutor == null) {
        return {
          errors: [{
            code: TutoriumEditErrorCode.TUTOR_NOT_FOUND
          }]
        }
      }
      tutorium.tutor = tutor
    }

    await tutorium.save()

    return {
      tutorium
    }
  } catch (error) {
    return {
      errors: [{
        code: TutoriumEditErrorCode.UNKNOWN_ERROR,
        message: error.message
      }]
    }
  }
}
