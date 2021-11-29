import { Field, ID, InputType, ObjectType, registerEnumType } from 'type-graphql'
import { Student } from '../../entity/Student'
import { Tutorium } from '../../entity/Tutorium'
import { Not } from 'typeorm'

export enum StudentEditErrorCode {
    UNKNOWN_ERROR,
    NOT_FOUND,
    NAME_TOO_SHORT,
    DUPLICATE_NAME,
    TUTORIUM_NOT_FOUND
}

registerEnumType(StudentEditErrorCode, {
  name: 'StudentEditErrorCode'
})

@ObjectType()
export class StudentEditError {
    @Field(() => StudentEditErrorCode)
    code: StudentEditErrorCode

    @Field({ nullable: true })
    message?: string
}

@ObjectType()
export class StudentEditResponse {
    @Field(() => Student, { nullable: true })
    student?: Student

    @Field(() => [StudentEditError], { nullable: true })
    errors?: StudentEditError[]
}

@InputType()
export class StudentEditInput {
    @Field(() => ID!)
    id: string

    @Field({ nullable: true })
    firstName?: string

    @Field({ nullable: true })
    lastName?: string

    @Field({ nullable: true })
    tutorium?: string
}

export async function editStudent (data: StudentEditInput): Promise<StudentEditResponse> {
  try {
    const student = await Student.findOne(data.id)
    if (student == null) {
      return {
        errors: [{
          code: StudentEditErrorCode.NOT_FOUND
        }]
      }
    }

    if (data.firstName != null) {
      if (data.firstName.length > 0) {
        student.firstName = data.firstName
      } else {
        return {
          errors: [{
            code: StudentEditErrorCode.NAME_TOO_SHORT,
            message: 'First and last name must be at least 1'
          }]
        }
      }
    }

    if (data.lastName != null) {
      if (data.lastName.length > 0) {
        student.lastName = data.lastName
      } else {
        return {
          errors: [{
            code: StudentEditErrorCode.NAME_TOO_SHORT,
            message: 'First and last name must be at least 1'
          }]
        }
      }
    }

    const existingStudents = await Student.find({ where: { lastName: student.lastName, firstName: student.firstName, id: Not(student.id) } })
    console.log(existingStudents)
    if (existingStudents.length > 0) {
      return {
        errors: [{
          code: StudentEditErrorCode.DUPLICATE_NAME,
          message: `A student with the name ${student.firstName} ${student.lastName} already exists`
        }]
      }
    }

    if (data.tutorium == null || data.tutorium === '') {
      student.tutorium = null
    }

    if (data.tutorium !== undefined && data.tutorium !== '') {
      const tutorium = await Tutorium.findOne(data.tutorium)
      if (tutorium == null) {
        return {
          errors: [{
            code: StudentEditErrorCode.TUTORIUM_NOT_FOUND
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
        code: StudentEditErrorCode.UNKNOWN_ERROR,
        message: error.message
      }]
    }
  }
}
