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

@Entity()
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
    excused: boolean

    @ManyToOne(() => Student, student => student.absences)
    @Field(() => Student)
    student: Student
}
