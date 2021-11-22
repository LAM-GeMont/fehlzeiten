import { Student } from "../entity/Student";
import { Context } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { createStudent, StudentCreateInput, StudentCreateResponse } from "./student/create";
import { editStudent, StudentEditInput, StudentEditResponse } from "./student/edit";
import { deleteStudent, StudentDeleteInput, StudentDeleteResponse } from "./student/delete";

@Resolver(Student)
export class StudentResolver {
    @Query(() => [Student])
    async students () {
        return await Student.find()
    }

    @Mutation(() => StudentCreateResponse)
    async createStudent (
        @Arg('data') data: StudentCreateInput,
        @Ctx() context: Context
    ) : Promise<StudentCreateResponse> {
        return createStudent(data, context)
    }

    @Mutation(() => StudentEditResponse)
    async editStudent (
        @Arg('data') data: StudentEditInput,
        @Ctx() context: Context
    ) : Promise<StudentEditResponse> {
        return editStudent(data, context)
    }

    @Mutation(() => StudentDeleteResponse)
    async deleteStudent(
        @Arg('data') data: StudentDeleteInput,
        @Ctx() context: Context
    ): Promise<StudentDeleteResponse> {
        return deleteStudent(data, context)
    }
}