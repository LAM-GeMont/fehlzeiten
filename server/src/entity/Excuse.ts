import { ID, ObjectType, Field, Int } from 'type-graphql'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { Student } from './Student'
import { User } from './User'

@Entity()
@ObjectType()
export class Excuse extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    @Field(() => ID)
    id: string

    @CreateDateColumn()
    @Field()
    createdAt: number

    @UpdateDateColumn()
    @Field()
    updatedAt: number

    @Column('date')
    @Field()
    startDate: string

    @Column('date')
    @Field()
    endDate: string

    @Column('varchar', {
      nullable: true,
      transformer: {
        from: (value: string | null): number[] | null => {
          if (value) {
            return JSON.parse(value)
          }
          return null
        },
        to: (value: number[] | null): string | null => {
          if (value) {
            return JSON.stringify(value)
          }
          return null
        }
      }
    })
    @Field(() => [Int])
    lessons?: number[]

    @ManyToOne(() => Student, student => student.excuses)
    @Field(() => Student)
    student: Student

    @ManyToOne(() => User, user => user.submittedAbsences)
    @Field(() => User)
    submittedBy: User
}
