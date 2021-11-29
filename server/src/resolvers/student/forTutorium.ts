import { Student } from '../../entity/Student'
import { Context } from '../../types'
import { Field, ObjectType, registerEnumType } from 'type-graphql'
import { Tutorium } from '../../entity/Tutorium'

export enum StudentsForTutoriumErrorCode {
  UNKNOWN_ERROR,
  INVALID_TUTORIUM_ID,
}

registerEnumType(StudentsForTutoriumErrorCode, {
  name: 'StudentsForTutoriumErrorCode'
})

@ObjectType()
export class StudentsForTutoriumError {
  @Field(() => StudentsForTutoriumErrorCode)
  code: StudentsForTutoriumErrorCode

  @Field({ nullable: true })
  message?: string
}

@ObjectType()
export class StudentsForTutoriumResponse {
  @Field(() => [Student], { nullable: true })
  students?: Student[]

  @Field(() => [StudentsForTutoriumError], { nullable: true })
  errors?: StudentsForTutoriumError[]
}

export async function studentsForTutorium (tutoriumId: string, { caller }: Context) : Promise<StudentsForTutoriumResponse> {
  try {
    if (caller == null) {
      throw new Error('Function was used without @Authorized directive')
    }

    console.log('test')

    const tutorium = await Tutorium.findOne(tutoriumId, { relations: ['students'] })
    if (tutorium == null) {
      return {
        errors: [{
          code: StudentsForTutoriumErrorCode.INVALID_TUTORIUM_ID,
          message: 'The given id does not match any Tutorium in the database.'
        }]
      }
    }

    console.log('test 2')
    console.log(tutorium.students)

    return {
      students: tutorium.students
    }
  } catch (error) {
    return {
      errors: [{
        code: StudentsForTutoriumErrorCode.UNKNOWN_ERROR,
        message: error.message
      }]
    }
  }
}
