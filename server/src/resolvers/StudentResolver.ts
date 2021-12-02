import { Student } from '../entity/Student'
import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, ResolverInterface, Root } from 'type-graphql'
import { createStudent, StudentCreateInput, StudentCreateResponse } from './student/create'
import { editStudent, StudentEditInput, StudentEditResponse } from './student/edit'
import { deleteStudent, StudentDeleteInput, StudentDeleteResponse } from './student/delete'
import { Context } from '../types'
import { Absence } from '../entity/Absence'
import { Role } from '../entity/User'
import { AbsenceResolver } from './AbsenceResolver'

function filterAsync<T> (array: T[], filter: (t: T) => Promise<boolean>) {
  return Promise.all(array.map(entry => filter(entry)))
    .then(bits => array.filter(() => bits.shift()))
}

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
  async absences (@Root() student: Student, @Ctx() context: Context, @Arg('semesterId', { nullable: true }) semesterId?: string) {
    if (context.caller == null) { return [] }

    const absences = await Absence.find({ where: { studentId: student.id } })
    const studentTutorium = await this.tutorium(student, context)
    const semester = semesterId != null ? await context.loaders.semester.load(semesterId) : null

    const semesterAbsences = absences.filter(absence => {
      if (semesterId === '' || semester == null) {
        return true
      }

      return absence.date > semester.startDate && absence.date < semester.endDate
    })

    if (context.caller.role === Role.COORDINATOR || context.caller.id === studentTutorium?.tutorId) {
      return semesterAbsences
    }

    return semesterAbsences.filter(absence => context.caller != null && absence.submittedById === context.caller.id)
  }

  @Authorized()
  @FieldResolver()
  async absenceSummary (@Root() student: Student, @Ctx() context: Context, @Arg('semesterId', { nullable: true }) semesterId?: string) {
    const tutorium = await this.tutorium(student, context)

    if (context.caller == null || (tutorium?.tutorId !== context.caller.id && context.caller.role !== Role.COORDINATOR)) {
      return undefined
    }

    const absences = await context.loaders.studentAbsences.load(student.id)

    const semester = semesterId != null ? await context.loaders.semester.load(semesterId) : null

    const semesterAbsences = absences.filter(absence => {
      if (semesterId === '' || semester == null) {
        return true
      }

      return absence.date > semester.startDate && absence.date < semester.endDate
    })

    const absenceResolver = new AbsenceResolver()

    const excusedHoursTotal = (await filterAsync(semesterAbsences, async absence => await absenceResolver.excused(absence, context))).length
    const unexcusedHoursTotal = semesterAbsences.length - excusedHoursTotal

    return {
      unexcusedDays: Math.floor(unexcusedHoursTotal / 6),
      unexcusedHours: unexcusedHoursTotal % 6,
      excusedDays: Math.floor(excusedHoursTotal / 6),
      excusedHours: excusedHoursTotal % 6
    }
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

    const excuses = await context.loaders.studentExcuses.load(student.id)
    context.loaders.studentExcuses.clear(student.id)
    return excuses
  }

  @Authorized()
  @Query(() => Student, { nullable: true })
  async student (
    @Arg('id') id: string,
    @Ctx() { loaders }: Context
  ) {
    return loaders.student.load(id)
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
