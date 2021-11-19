import { ID, ObjectType, Field } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

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

    @Column()
    @Field()
    excused: boolean
}
