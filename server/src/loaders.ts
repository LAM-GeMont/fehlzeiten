import { BaseEntity } from 'typeorm'
import DataLoader, { BatchLoadFn } from 'dataloader'
import { Tutorium } from './entity/Tutorium'
import { Absence } from './entity/Absence'
import { Excuse } from './entity/Excuse'
import { Student } from './entity/Student'
import { User } from './entity/User'

function CreateBatchFn<T extends BaseEntity & { id: string }> (findByIds: (ids: string[]) => Promise<T[]>): BatchLoadFn<string, T> {
  return async (ids: readonly string[]) => {
    const objects = await findByIds(ids as string[])
    const objectsByIds: Record<string, T> = {}
    objects.forEach((t: T) => {
      objectsByIds[t.id] = t
    })

    console.log()
    console.log()
    console.log('Loaded', ids.length, 'Tutoriums')
    console.log()
    console.log()

    return ids.map((id) => objectsByIds[id])
  }
}

export const createAbsenceLoader = () => new DataLoader(CreateBatchFn<Absence>((ids) => Absence.findByIds(ids)))
export const createExcuseLoader = () => new DataLoader(CreateBatchFn<Excuse>((ids) => Excuse.findByIds(ids)))
export const createStudentLoader = () => new DataLoader(CreateBatchFn<Student>((ids) => Student.findByIds(ids)))
export const createTutoriumLoader = () => new DataLoader(CreateBatchFn<Tutorium>((ids) => Tutorium.findByIds(ids)))
export const createUserLoader = () => new DataLoader(CreateBatchFn<User>((ids) => User.findByIds(ids)))
