import { Arg, Authorized, Ctx, Mutation, Resolver } from 'type-graphql'
import { Excuse } from '../entity/Excuse'
import { Context } from '../types'
import {
  ExcuseCreateInput,
  ExcuseCreateResponse,
  createExcuse
} from './excuse/create'

@Resolver(Excuse)
export class ExcuseResolver {
  @Authorized()
  @Mutation(() => ExcuseCreateResponse)
  async createExcuse (
    @Arg('data') data: ExcuseCreateInput,
    @Ctx() context: Context
  ) : Promise<ExcuseCreateResponse> {
    return createExcuse(data, context)
  }
}
