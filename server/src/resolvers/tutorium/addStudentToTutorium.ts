import { Student } from '../../entity/Student'
import { Tutorium } from '../../entity/Tutorium'
import { registerEnumType, ObjectType, Field, InputType, ID } from 'type-graphql'

export enum AddStudentToTutoriumErrorCode {
    UNKNOWN_ERROR,
    STUDENT_NOT_FOUND,
    TUTORIUM_NOT_FOUND,
}

registerEnumType(AddStudentToTutoriumErrorCode, {
    name: 'AddStudentToTutoriumErrorCode'
})

@ObjectType()
export class AddStudentToTutoriumError {
    @Field(() => AddStudentToTutoriumErrorCode)
    code: AddStudentToTutoriumErrorCode

    @Field({ nullable: true })
    message?: string
}

@ObjectType()
export class AddStudentToTutoriumResponse {
    @Field(() => [AddStudentToTutoriumError], { nullable: true })
    errors?: AddStudentToTutoriumError[]

    @Field(() => [AddStudentToTutoriumError], { nullable: true })
    students?: AddStudentToTutoriumError[]
}

@InputType()
export class AddStudentToTutoriumInput {
    @Field(() => ID!)
    id: string

    @Field(() => ID!)
    tutorium?: string
}

export async function addStudentToTutorium (data: AddStudentToTutoriumInput): Promise<AddStudentToTutoriumResponse> {
    try {
        const student = await Student.findOne(data.id)
        if (student == null) {
            return {
                errors: [
                    {
                        code: AddStudentToTutoriumErrorCode.STUDENT_NOT_FOUND
                    }
                ]
            }
        }
        const tutorium = await Tutorium.findOne(data.tutorium)
        if (tutorium == null) {
            return {
                errors: [
                    {
                        code: AddStudentToTutoriumErrorCode.TUTORIUM_NOT_FOUND
                    }
                ]
            }
        }

        student.tutorium = tutorium

        await student.save()

        return {
            student
        }
    } catch (error) {
        return {
            errors: [
                {
                    code: AddStudentToTutoriumErrorCode.UNKNOWN_ERROR,
                    message: error.message
                }
            ]
        }
    }
}
