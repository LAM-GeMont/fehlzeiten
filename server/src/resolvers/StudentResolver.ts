import { Student } from '../entity/Student'
import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, ResolverInterface, Root } from 'type-graphql'
import { createStudent, StudentCreateInput, StudentCreateResponse } from './student/create'
import { editStudent, StudentEditInput, StudentEditResponse } from './student/edit'
import { deleteStudent, StudentDeleteInput, StudentDeleteResponse } from './student/delete'
import { Context } from '../types'
import { Absence } from '../entity/Absence'
import { Excuse } from '../entity/Excuse'
import { Role } from '../entity/User'
import { studentsForTutorium, StudentsForTutoriumResponse } from './student/forTutorium'

@Resolver(Student)
export class StudentResolver implements ResolverInterface<Student> {
  @Authorized()
  @FieldResolver()
  async tutorium (@Root() student: Student, @Ctx() { loaders }: Context) {
    if (student.tutoriumId == null) {
      return undefined
    }
    return loaders.tutorium.load(student.tutoriumId)
  }

  @Authorized()
  @FieldResolver()
  async absences (@Root() student: Student, @Ctx() context: Context) {
    if (context.caller == null) { return [] }

    const absences = await Absence.find({ where: { studentId: student.id } })
    const studentTutorium = await this.tutorium(student, context)

    if (context.caller.role === Role.COORDINATOR || context.caller.id === studentTutorium?.tutorId) {
      return absences
    }

    return absences.filter(absence => context.caller != null && absence.submittedById === context.caller.id)
  }

  @Authorized()
  @FieldResolver()
  async excuses (@Root() student: Student, @Ctx() context: Context) {
    if (context.caller == null) { return [] }

    const caller = context.caller
    const studentTutorium = await this.tutorium(student, context)

    if (caller.role !== Role.COORDINATOR && caller.id !== studentTutorium?.tutorId) {
      return []
    }

    return Excuse.find({ where: { studentId: student.id } })
  }

  @Authorized()
  @Query(() => [StudentsForTutoriumResponse])
  async studentsForTutorium (
    @Arg('tutoriumId') tutoriumId: string,
    @Ctx() context: Context
  ) {
    return studentsForTutorium(tutoriumId, context)
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
