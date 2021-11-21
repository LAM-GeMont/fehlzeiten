import { Context } from '../types'
import { ID, ObjectType, Field, registerEnumType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Tutorium } from './Tutorium'
import { Absence } from './Absence'

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

    @Column()
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

    static fromContext (context: Context) {
      if (context.req.session.userId == null) {
        return undefined
      }
      return User.findOne(context.req.session.userId)
    }

    isCoordinator () {
      return this.role === Role.COORDINATOR
    }

    isTeacher () {
      return this.role === Role.TEACHER
    }
}
