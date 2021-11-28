import { Field, ID, InputType, ObjectType, registerEnumType } from 'type-graphql'
import { Tutorium } from '../../entity/Tutorium'
import { Not } from 'typeorm'
import {User} from "../../entity/User";

export enum TutoriumEditErrorCode {
    UNKNOWN_ERROR,
    NOT_FOUND,
    NAME_TOO_SHORT,
    DUPLICATE_NAME,
    TUTOR_NOT_FOUND
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
    @Field(() => ID!)
    id: string

    @Field({ nullable: true })
    name?: string

    @Field({ nullable: true })
    tutorId?: string
}

export async function editTutorium (data: TutoriumEditInput): Promise<TutoriumEditResponse> {
    try {
        const tutorium = await Tutorium.findOne(data.id)
        if (tutorium == null) {
            return {
                errors: [{
                    code: TutoriumEditErrorCode.NOT_FOUND
                }]
            }
        }

        if (data.name != null) {
            if (data.name.length > 0) {
                tutorium.name = data.name
            } else {
                return {
                    errors: [{
                        code: TutoriumEditErrorCode.NAME_TOO_SHORT,
                        message: 'Tutorium name must be at least 1'
                    }]
                }
            }
        }

        /*
        if (data.tutor != null) {
            if (data.tutor.length > 0) {
                tutorium.tutor = await User.findOne(data.tutor)
            } else {
                return {
                    errors: [{
                        code: TutoriumEditErrorCode.NAME_TOO_SHORT,
                        message: 'Tutor name must be at least 1'
                    }]
                }
            }
        }
        */

        const existingTutoriums = await Tutorium.find({ where: { name: tutorium.name, id: Not(tutorium.id) } })
        console.log(existingTutoriums)
        if (existingTutoriums.length > 0) {
            return {
                errors: [{
                    code: TutoriumEditErrorCode.DUPLICATE_NAME,
                    message: `A Tutorium with the name ${tutorium.name} already exists`
                }]
            }
        }

        if (data.tutorId == null || data.tutorId === '') {
            tutorium.tutor = null
        }

        if (data.tutorId !== undefined && data.tutorId !== '') {
            const tutor = await User.findOne(data.tutorId)
            if (tutor == null) {
                return {
                    errors: [{
                        code: TutoriumEditErrorCode.TUTOR_NOT_FOUND
                    }]
                }
            }
            tutorium.tutor = tutor
        }

        await tutorium.save()

        return {
            tutorium
        }
    } catch (error) {
        return {
            errors: [{
                code: TutoriumEditErrorCode.UNKNOWN_ERROR,
                message: error.message
            }]
        }
    }
}
