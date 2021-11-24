import { ID, ObjectType, Field } from 'type-graphql'
import { BaseEntity, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Absence } from './Absence'
import { Excuse } from './Excuse'

@Entity()
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

    @OneToMany(() => Absence, absence => absence.student)
    @Field(() => [Absence])
    absences: Absence[]

    @OneToMany(() => Excuse, excuse => excuse.student)
    @Field(() => [Excuse])
    excuses: Excuse[]
}
