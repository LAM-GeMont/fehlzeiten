import { ID, ObjectType, Field } from 'type-graphql'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity, PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity()
@ObjectType()
export class Semester extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string

  @CreateDateColumn()
  @Field()
  createdAt: number

  @UpdateDateColumn()
  @Field()
  updatedAt: number

  @Column('date')
  @Field()
  startDate: string

  @Column('date')
  @Field()
  endDate: string

  @Column()
  @Field()
  name: string
}
