import { Student } from '../../entity/Student'
import { registerEnumType, ObjectType, Field, InputType, ID } from 'type-graphql'

export enum DeleteStudentFromTutoriumErrorCode {
    UNKNOWN_ERROR,
    NOT_FOUND,
}

registerEnumType(DeleteStudentFromTutoriumErrorCode, {
  name: 'DeleteStudentFromTutoriumErrorCode'
})

@ObjectType()
export class DeleteStudentFromTutoriumError {
    @Field(() => DeleteStudentFromTutoriumErrorCode)
    code: DeleteStudentFromTutoriumErrorCode

    @Field({ nullable: true })
    message?: string
}

@ObjectType()
export class DeleteStudentFromTutoriumResponse {
    @Field(() => [DeleteStudentFromTutoriumError], { nullable: true })
    errors?: DeleteStudentFromTutoriumError[]
}

@InputType()
export class DeleteStudentFromTutoriumInput {
    @Field(() => ID!)
    id: string
}

export async function deleteStudentFromTutorium (data: DeleteStudentFromTutoriumInput): Promise<DeleteStudentFromTutoriumResponse> {
  try {
    const student = await Student.findOne(data.id)
    if (student == null) {
      return {
        errors: [
          {
            code: DeleteStudentFromTutoriumErrorCode.NOT_FOUND
          }
        ]
      }
    }

    student.tutorium = null

    await student.save()

    return {
    }
  } catch (error) {
    return {
      errors: [
        {
          code: DeleteStudentFromTutoriumErrorCode.UNKNOWN_ERROR,
          message: error.message
        }
      ]
    }
  }
}
