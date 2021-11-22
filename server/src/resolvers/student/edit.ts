import { Context } from "../../types";
import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";
import { User } from "../../entity/User";
import { Student } from "../../entity/Student";
import { Tutorium } from "../../entity/Tutorium";

export enum StudentEditErrorCode {
    UNKNOWN_ERROR,
    NOT_FOUND,
    UNAUTHORIZED,
    NAME_TOO_SHORT,
    TUTORIUM_NOT_FOUND
}

registerEnumType(StudentEditErrorCode, {
    name: 'StudentEditErrorCode'
})

@ObjectType()
export class StudentEditError {
    @Field(() => StudentEditErrorCode)
    code: StudentEditErrorCode

    @Field({nullable: true})
    message?: string
}

@ObjectType()
export class StudentEditResponse {
    @Field(() => Student, {nullable: true})
    student?: Student

    @Field(() => [StudentEditError], {nullable: true})
    errors?: StudentEditError[]
}

@InputType()
export class StudentEditInput {
    @Field(() => ID!)
    id: string

    @Field({nullable: true})
    firstName?: string

    @Field({nullable: true})
    lastName?: string

    @Field(() => ID!, {nullable: true})
    tutorium?: string
}

export async function editStudent(data: StudentEditInput, context: Context): Promise<StudentEditResponse> {
    try {
        const caller = await User.fromContext(context)
        if (caller == null || !caller.isCoordinator) {
            return {
                errors: [{
                    code: StudentEditErrorCode.UNAUTHORIZED
                }]
            }
        }

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
                        message: "First and last name must be at least 1"
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
                        message: "First and last name must be at least 1"
                    }]
                }
            }
        }

        if (data.tutorium === null) {
            student.tutorium = null
        }

        if (data.tutorium != undefined) {
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