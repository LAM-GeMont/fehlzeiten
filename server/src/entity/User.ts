import { ID, ObjectType, Field, registerEnumType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Tutorium } from './Tutorium'

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
}
