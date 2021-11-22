import { ID, Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Tutorium } from "./Tutorium";

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

    @Column()
    @Field()
    firstName: string

    @Column()
    @Field()
    lastName: string

    @ManyToOne(() => Tutorium, tutorium => tutorium.students)
    @Field(() => Tutorium, {nullable: true})
    tutorium?: Tutorium | null

    @Column({nullable: true})
    tutoriumId?: string
}