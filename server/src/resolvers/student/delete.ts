import { Field, ID, InputType, ObjectType, registerEnumType } from 'type-graphql'
import { Student } from '../../entity/Student'

export enum StudentDeleteErrorCode {
    UNKNOWN_ERROR,
    NOT_FOUND,
}

registerEnumType(StudentDeleteErrorCode, {
  name: 'StudentDeleteErrorCode'
})

@ObjectType()
export class StudentDeleteError {
    @Field(() => StudentDeleteErrorCode)
    code: StudentDeleteErrorCode

    @Field({ nullable: true })
    message?: string
}

@ObjectType()
export class StudentDeleteResponse {
    @Field(() => [StudentDeleteError], { nullable: true })
    errors?: StudentDeleteError[]
}

@InputType()
export class StudentDeleteInput {
    @Field(() => ID!)
    id: string
}

export async function deleteStudent (data: StudentDeleteInput): Promise<StudentDeleteResponse> {
  try {
    const student = await Student.findOne(data.id)
    if (student == null) {
      return {
        errors: [{
          code: StudentDeleteErrorCode.NOT_FOUND
        }]
      }
    }

    await student.remove()

    return {
    }
  } catch (error) {
    return {
      errors: [{
        code: StudentDeleteErrorCode.UNKNOWN_ERROR,
        message: error.message
      }]
    }
  }
}
