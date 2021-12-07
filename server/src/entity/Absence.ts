import { ID, ObjectType, Field } from 'type-graphql'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { Student } from './Student'
import { User } from './User'

@Entity()
@Index(['lessonIndex', 'date', 'studentId'], { unique: true })
@ObjectType()
export class Absence extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    @Field(() => ID)
    id: string

    @CreateDateColumn()
    @Field()
    createdAt: number

    @UpdateDateColumn()
    @Field()
    updatedAt: number

    /**
     * Meant is the lesson index (starting at 1) throughout the school day
     * Examples:
     * '1. Schulstunde' -> 1
     */
    @Column()
    @Field()
    lessonIndex: number

    /**
     * Example: 2021-01-25 (ISO string)
     */
    @Column('date')
    @Field()
    date: string

    @Column({ default: false })
    @Field()
    exam: boolean

    @Column()
    studentId: string

    @ManyToOne(() => Student, student => student.absences, { nullable: false, onDelete: 'CASCADE' })
    @Field(() => Student)
    student: Student

    @Column({ nullable: true })
    submittedById?: string

    @ManyToOne(() => User, user => user.submittedAbsences, { onDelete: 'SET NULL' })
    @Field(() => User, { nullable: true })
    submittedBy?: User

    @Field()
    excused: boolean
}
