import { Student } from '../entity/Student'
import { Arg, Authorized, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql'
import { createStudent, StudentCreateInput, StudentCreateResponse } from './student/create'
import { editStudent, StudentEditInput, StudentEditResponse } from './student/edit'
import { deleteStudent, StudentDeleteInput, StudentDeleteResponse } from './student/delete'
import { Tutorium } from '../entity/Tutorium'

@Resolver(Student)
export class StudentResolver {
  @Authorized()
  @FieldResolver()
  async tutorium (@Root() student: Student) {
    return await Tutorium.findOne({ where: { id: student.tutoriumId } })
  }

  @Authorized()
  @Query(() => [Student])
  async students () {
    return await Student.find()
  }

  @Authorized('COORDINATOR')
  @Mutation(() => StudentCreateResponse)
  async createStudent (
    @Arg('data') data: StudentCreateInput
  ): Promise<StudentCreateResponse> {
    return createStudent(data)
  }

  @Authorized('COORDINATOR')
  @Mutation(() => StudentEditResponse)
  async editStudent (
     @Arg('data') data: StudentEditInput
  ): Promise<StudentEditResponse> {
    return editStudent(data)
  }

  @Authorized('COORDINATOR')
  @Mutation(() => StudentDeleteResponse)
  async deleteStudent (
    @Arg('data') data: StudentDeleteInput
  ): Promise<StudentDeleteResponse> {
    return deleteStudent(data)
  }
}
