import { ID, ObjectType, Field, registerEnumType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Tutorium } from './Tutorium'
import { Absence } from './Absence'
import { Excuse } from './Excuse'

export enum Role {
    TEACHER,
    COORDINATOR
}

registerEnumType(Role, {
  name: 'Role',
  description: 'The role of a user.'
})

@Entity()
@ObjectType()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    @Field(() => ID)
    id: string

    @CreateDateColumn()
    @Field()
    createdAt: number

    @UpdateDateColumn()
    @Field()
    updatedAt: number

    @Column({ unique: true })
    @Field()
    name: string

    @Column({ nullable: true })
    password: string

    @Column('int')
    @Field(() => Role)
    role: Role

    @OneToMany(() => Tutorium, tutorium => tutorium.tutor)
    @Field(() => [Tutorium])
    tutoriums: Tutorium[]

    @OneToMany(() => Absence, absence => absence.submittedBy)
    @Field(() => [Absence])
    submittedAbsences: Absence[]

    @OneToMany(() => Excuse, excuse => excuse.submittedBy)
    @Field(() => [Excuse])
    submittedExcuses: Excuse[]

    @Column({ nullable: true })
    @Field()
    iservUUID: string

    isCoordinator () {
      return this.role === Role.COORDINATOR
    }

    isTeacher () {
      return this.role === Role.TEACHER
    }
}
