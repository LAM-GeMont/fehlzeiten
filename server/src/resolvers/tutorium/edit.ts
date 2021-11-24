import { Tutorium } from '../../entity/Tutorium'
import { Field, InputType, ObjectType, registerEnumType } from 'type-graphql'
import { Context } from '../../types'
import { User } from '../../entity/User'

export enum TutoriumEditErrorCode {
    UNKNOWN_ERROR,
    UNAUTHORIZED,
    NAME_TOO_SHORT,
    DUPLICATE_NAME,
    TUTORIUM_NOT_FOUND
}

registerEnumType(TutoriumEditErrorCode, {
    name: 'TutoriumEditErrorCode'
})

@ObjectType()
export class TutoriumEditError {
    @Field(() => TutoriumEditErrorCode)
    code: TutoriumEditErrorCode

    @Field({ nullable: true })
    message?: string
}

@ObjectType()
export class TutoriumEditResponse {
    @Field(() => Tutorium, { nullable: true })
    tutorium?: Tutorium

    @Field(() => [TutoriumEditError], { nullable: true })
    errors?: TutoriumEditError[]
}

@InputType()
export class TutoriumEditInput {
    @Field()
    name: string
}

export async function editTutorium (args: TutoriumEditInput, context: Context) : Promise<TutoriumEditResponse> {
    try {
        const caller = await User.fromContext(context)
        if (caller == null || !caller.isCoordinator) {
            return {
                errors: [{
                    code: TutoriumEditErrorCode.UNAUTHORIZED
                }]
            }
        }

        if (args.name.length < 1) {
            return {
                errors: [{
                    code: TutoriumEditErrorCode.NAME_TOO_SHORT,
                    message: 'Must be altleast 1'
                }]
            }
        }

        const tutorium = await Tutorium.findOne(args.name)

        if (tutorium == null) {
            return {
                errors: [{
                    code: TutoriumEditErrorCode.TUTORIUM_NOT_FOUND
                }]
            }
        }

        tutorium.name = args.name

        await tutorium.save()

        return {
            tutorium
        }

        /*
        const tutorium = new Tutorium()
        tutorium.name = args.name
        await tutorium.save()

        return {
            tutorium
        }
         */

    } catch (error) {
        if (error.message.includes('UNIQUE')) {
            return {
                errors: [{
                    code: TutoriumEditErrorCode.DUPLICATE_NAME,
                    message: error.message
                }]
            }
        }
        return {
            errors: [{
                code: TutoriumEditErrorCode.UNKNOWN_ERROR,
                message: error.message
            }]
        }
    }
}
