import type {User, Note2, Annotation} from '@prisma/client'

import {prisma } from '~/db.server'

export type {Note2} from '@prisma/client'


export async function addAnnotation({userId, noteId, propertyName, value, isValidated}: {userId: User['id'], 
noteId: Note2['id'],
propertyName: Annotation['propertyName'],
value: Annotation['value'],
isValidated: boolean
}
) {

    if (isValidated){

       const validatedAnnotation = await prisma.validatedAnnotation.findFirst({
            where: {
                propertyName,
                value,
                note2Id: noteId
            }
        })

        if (!validatedAnnotation) {
            await prisma.validatedAnnotation.create({
                data: {
                    propertyName,
                    value,
                    note2: {
                        connect: {
                            id: noteId
                        }
                    }
                },
            })
        }
    }

   return prisma.annotation.create({
        data: {
            propertyName,
            value,
            user: {
                connect: {
                    id: userId
                }
            },
            note2: {
                connect: {
                    id: noteId
                }
            }
        }
    })
}
