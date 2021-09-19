import { Tutorium } from '../entity/Tutorium'
import { Arg, Field, Mutation, ObjectType, Query, registerEnumType, Resolver } from 'type-graphql'

enum TutoriumCreateErrorCode {
  UNKNOWN_ERROR,
  NAME_TOO_SHORT,
  DUPLICATE_NAME
}

registerEnumType(TutoriumCreateErrorCode, {
  name: 'TutoriumCreateErrorCode'
})

@ObjectType()
class Error {
  @Field(() => TutoriumCreateErrorCode)
  code: TutoriumCreateErrorCode

  @Field({ nullable: true })
  message?: string
}

@ObjectType()
class TutoriumCreateResponse {
  @Field(() => Tutorium, { nullable: true })
  tutorium?: Tutorium

  @Field(() => [Error], { nullable: true })
  errors?: Error[]
}

@Resolver(Tutorium)
export class TutoriumResolver {
  @Query(() => [Tutorium])
  async tutoriums () {
    return await Tutorium.find()
  }

  @Mutation(() => TutoriumCreateResponse)
  async createTutorium (
    @Arg('name') name: string
  ) {
    try {
      if (name.length < 1) {
        return {
          errors: [
            {
              code: TutoriumCreateErrorCode.NAME_TOO_SHORT,
              message: 'Must be altleast 1'
            }
          ]
        }
      }

      const tutorium = new Tutorium()
      tutorium.name = name
      await tutorium.save()

      return {
        tutorium
      }
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        return {
          errors: [
            {
              code: TutoriumCreateErrorCode.DUPLICATE_NAME,
              message: error.message
            }
          ]
        }
      }
      return {
        errors: [
          {
            code: TutoriumCreateErrorCode.UNKNOWN_ERROR,
            message: error.message
          }
        ]
      }
    }
  }
}
