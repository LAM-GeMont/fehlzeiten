import { Context } from '../../types'
import { Field, ID, InputType, ObjectType, registerEnumType } from 'type-graphql'
import { User } from '../../entity/User'
import { Student } from '../../entity/Student'

export enum StudentDeleteErrorCode {
    UNKNOWN_ERROR,
    NOT_FOUND,
    UNAUTHORIZED
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

export async function deleteStudent (data: StudentDeleteInput, context: Context): Promise<StudentDeleteResponse> {
  try {
    const caller = await User.fromContext(context)
    if (caller == null || !caller.isCoordinator) {
      return {
        errors: [{
          code: StudentDeleteErrorCode.UNAUTHORIZED
        }]
      }
    }

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
