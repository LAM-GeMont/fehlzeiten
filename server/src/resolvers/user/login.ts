import { User } from '../../entity/User'
import { Field, InputType, ObjectType, registerEnumType } from 'type-graphql'
import argon2 from 'argon2'
import { Context } from '../../types'

export enum UserLoginErrorCode {
  UNKNOWN_ERROR,
  BAD_AUTHENTICATION,
  USER_IS_ISERV_ONLY
}

registerEnumType(UserLoginErrorCode, {
  name: 'UserLoginErrorCode'
})

@ObjectType()
export class UserLoginError {
  @Field(() => UserLoginErrorCode)
  code: UserLoginErrorCode

  @Field({ nullable: true })
  message?: string
}

@ObjectType()
export class UserLoginResponse {
  @Field(() => User, { nullable: true })
  user?: User

  @Field(() => [UserLoginError], { nullable: true })
  errors?: UserLoginError[]
}

@InputType()
export class UserLoginInput {
  @Field()
  name: string

  @Field()
  password: string
}

export async function loginUser (args: UserLoginInput, { req }: Context) : Promise<UserLoginResponse> {
  try {
    const user = await User.findOne({
      where: {
        name: args.name
      }
    })

    if (user?.password == null) {
      return {
        errors: [{
          code: UserLoginErrorCode.USER_IS_ISERV_ONLY
        }]
      }
    }

    if (user == null || !(await argon2.verify(user.password, args.password))) {
      return {
        errors: [{
          code: UserLoginErrorCode.BAD_AUTHENTICATION
        }]
      }
    }

    req.session.userId = user.id

    return {
      user
    }
  } catch (error) {
    return {
      errors: [{
        code: UserLoginErrorCode.UNKNOWN_ERROR,
        message: error.message
      }]
    }
  }
}
