import { ID, ObjectType, Field } from 'type-graphql'
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

    @Column({ nullable: true })
    @Field()
    lessons?: string

    @ManyToOne(() => Student, student => student.excuses)
    @Field(() => Student)
    student: Student

    @ManyToOne(() => User, user => user.submittedAbsences)
    @Field(() => User)
    submittedBy: User
}
