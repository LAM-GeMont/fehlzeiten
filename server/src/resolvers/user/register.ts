import { Role, User } from '../../entity/User'
import { Field, InputType, ObjectType, registerEnumType } from 'type-graphql'
import argon2 from 'argon2'
import { Context } from '../../types'

export enum UserRegisterErrorCode {
  UNKNOWN_ERROR,
  NAME_TOO_SHORT,
  DUPLICATE_NAME,
  PASSWORD_TOO_SHORT
}

registerEnumType(UserRegisterErrorCode, {
  name: 'UserRegisterErrorCode'
})

@ObjectType()
export class UserRegisterError {
  @Field(() => UserRegisterErrorCode)
  code: UserRegisterErrorCode

  @Field({ nullable: true })
  message?: string
}

@ObjectType()
export class UserRegisterResponse {
  @Field(() => User, { nullable: true })
  user?: User

  @Field(() => [UserRegisterError], { nullable: true })
  errors?: UserRegisterError[]
}

@InputType()
export class UserRegisterInput {
  @Field()
  name: string

  @Field()
  password: string

  @Field(() => Role)
  role: Role
}

export async function registerUser (args: UserRegisterInput, { req }: Context) : Promise<UserRegisterResponse> {
  try {
    if (args.name.length < 1) {
      return {
        errors: [{
          code: UserRegisterErrorCode.NAME_TOO_SHORT,
          message: 'Must be altleast 1'
        }]
      }
    }

    if (args.password.length < 5) {
      return {
        errors: [{
          code: UserRegisterErrorCode.PASSWORD_TOO_SHORT,
          message: 'Must be altleast 5'
        }]
      }
    }

    const user = new User()
    user.name = args.name
    user.password = await argon2.hash(args.password)
    user.role = args.role
    await user.save()

    req.session.userId = user.id

    return {
      user
    }
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return {
        errors: [{
          code: UserRegisterErrorCode.DUPLICATE_NAME,
          message: error.message
        }]
      }
    }
    return {
      errors: [{
        code: UserRegisterErrorCode.UNKNOWN_ERROR,
        message: error.message
      }]
    }
  }
}
