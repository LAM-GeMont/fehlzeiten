import { ID, Field, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { Tutorium } from './Tutorium'
import { Absence } from './Absence'
import { Excuse } from './Excuse'

@Entity()
@Index(['firstName', 'lastName'], { unique: true })
@ObjectType()
export class Student extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    @Field(() => ID)
    id: string

    @CreateDateColumn()
    @Field()
    createdAt: number

    @UpdateDateColumn()
    @Field()
    updatedAt: number

    @Column()
    @Field()
    firstName: string

    @Column()
    @Field()
    lastName: string

    @Column({ nullable: true })
    tutoriumId?: string

    @ManyToOne(() => Tutorium, tutorium => tutorium.students, { onDelete: 'SET NULL' })
    @Field(() => Tutorium, { nullable: true })
    tutorium?: Tutorium | null

    @OneToMany(() => Absence, absence => absence.student)
    @Field(() => [Absence])
    absences: Absence[]

    @OneToMany(() => Excuse, excuse => excuse.student)
    @Field(() => [Excuse])
    excuses: Excuse[]
}
