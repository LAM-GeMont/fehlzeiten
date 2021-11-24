import { Context } from '../../types'
import { Student } from '../../entity/Student'
import { User } from '../../entity/User'
import { Field, InputType, ObjectType, registerEnumType } from 'type-graphql'
import { Tutorium } from '../../entity/Tutorium'

export enum StudentCreateErrorCode {
    UNKNOWN_ERROR,
    UNAUTHORIZED,
    NAME_TOO_SHORT,
    DUPLICATE_NAME,
    TUTORIUM_NOT_FOUND
}

registerEnumType(StudentCreateErrorCode, {
  name: 'StudentCreateErrorCode'
})

@ObjectType()
export class StudentCreateError {
    @Field(() => StudentCreateErrorCode)
    code: StudentCreateErrorCode

    @Field({ nullable: true })
    message?: string
}

@ObjectType()
export class StudentCreateResponse {
    @Field(() => Student, { nullable: true })
    student?: Student

    @Field(() => [StudentCreateError], { nullable: true })
    errors?: StudentCreateError[]
}

@InputType()
export class StudentCreateInput {
    @Field()
    firstName: string

    @Field()
    lastName: string

    @Field({ nullable: true })
    tutoriumId?: string
}

export async function createStudent (args: StudentCreateInput, context: Context) : Promise<StudentCreateResponse> {
  try {
    const caller = await User.fromContext(context)
    if (caller == null || !caller.isCoordinator) {
      return {
        errors: [{
          code: StudentCreateErrorCode.UNAUTHORIZED
        }]
      }
    }

    if (args.firstName.length < 1 || args.lastName.length < 1) {
      return {
        errors: [{
          code: StudentCreateErrorCode.NAME_TOO_SHORT,
          message: 'First and last name must be at least 1'
        }]
      }
    }

    const existingStudents = await Student.find({ where: { lastName: args.lastName, firstName: args.firstName } })
    if (existingStudents.length > 0) {
      return {
        errors: [{
          code: StudentCreateErrorCode.DUPLICATE_NAME,
          message: `A student with the name ${args.firstName} ${args.lastName} already exists`
        }]
      }
    }

    const student = new Student()
    student.firstName = args.firstName
    student.lastName = args.lastName

    if (args.tutoriumId !== undefined && args.tutoriumId !== '') {
      const tutorium = await Tutorium.findOne(args.tutoriumId)
      if (tutorium == null) {
        return {
          errors: [{
            code: StudentCreateErrorCode.TUTORIUM_NOT_FOUND
          }]
        }
      }
      student.tutorium = tutorium
    }

    await student.save()

    return {
      student
    }
  } catch (error) {
    return {
      errors: [{
        code: StudentCreateErrorCode.UNKNOWN_ERROR,
        message: error.message
      }]
    }
  }
}
