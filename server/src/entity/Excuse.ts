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
    @Field(() => [Int], { nullable: true })
    lessons?: number[]

    @Column()
    studentId: string

    @ManyToOne(() => Student, student => student.excuses, { nullable: false, onDelete: 'CASCADE' })
    @Field(() => Student)
    student: Student

    @Column({ default: false })
    @Field()
    validForExam: boolean

    @Column({ nullable: true })
    submittedById?: string

    @ManyToOne(() => User, user => user.submittedAbsences, { onDelete: 'SET NULL' })
    @Field(() => User, { nullable: true })
    submittedBy?: User
}
