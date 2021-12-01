import { BaseEntity } from 'typeorm'
import DataLoader, { BatchLoadFn } from 'dataloader'
import { Tutorium } from './entity/Tutorium'
import { Absence } from './entity/Absence'
import { Excuse } from './entity/Excuse'
import { Student } from './entity/Student'
import { User } from './entity/User'
import { Semester } from './entity/Semester'

function CreateBatchFn<T extends BaseEntity & { id: string }> (findByIds: (ids: string[]) => Promise<T[]>): BatchLoadFn<string, T> {
  return async (ids: readonly string[]) => {
    const objects = await findByIds(ids as string[])
    const objectsByIds: Record<string, T> = {}
    objects.forEach((t: T) => {
      objectsByIds[t.id] = t
    })

    return ids.map((id) => objectsByIds[id])
  }
}

const StudentExcusesBatchFn = async (studentIds: readonly string[]) => {
  const excuses = await Excuse.find({ where: studentIds.map(id => ({ studentId: id })) })
  const excusesByStudentIds: Record<string, Excuse[]> = {}
  excuses.forEach((excuse: Excuse) => {
    if (excusesByStudentIds[excuse.studentId] == null) {
      excusesByStudentIds[excuse.studentId] = []
    }
    excusesByStudentIds[excuse.studentId].push(excuse)
  })

  return studentIds.map((id) => excusesByStudentIds[id])
}

export const createAbsenceLoader = () => new DataLoader(CreateBatchFn<Absence>((ids) => Absence.findByIds(ids)))
export const createExcuseLoader = () => new DataLoader(CreateBatchFn<Excuse>((ids) => Excuse.findByIds(ids)))
export const createStudentLoader = () => new DataLoader(CreateBatchFn<Student>((ids) => Student.findByIds(ids)))
export const createTutoriumLoader = () => new DataLoader(CreateBatchFn<Tutorium>((ids) => Tutorium.findByIds(ids)))
export const createUserLoader = () => new DataLoader(CreateBatchFn<User>((ids) => User.findByIds(ids)))
export const createSemesterLoader = () => new DataLoader(CreateBatchFn<Semester>((ids) => Semester.findByIds(ids)))
export const createStudentExcuseLoader = () => new DataLoader(StudentExcusesBatchFn)
