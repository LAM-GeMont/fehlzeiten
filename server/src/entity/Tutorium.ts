import { ID, ObjectType, Field } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from './User'

@Entity()
@ObjectType()
export class Tutorium extends BaseEntity {
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

    @ManyToOne(() => User, user => user.tutoriums)
    @Field(() => User)
    tutor: User
}
