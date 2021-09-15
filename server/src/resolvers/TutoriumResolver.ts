import { Tutorium } from '../entity/Tutorium'
import { Query, Resolver } from 'type-graphql'

@Resolver(Tutorium)
export class TutoriumResolver {
  @Query(() => [Tutorium])
  async tutoriums () {
    return Tutorium.find()
  }
}
