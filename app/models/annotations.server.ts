import type { User, Note2, Annotation } from "@prisma/client";

import { prisma } from "~/db.server";
import type { FieldsType } from "~/utils/constants";

export type { Note2 } from "@prisma/client";

/**
 * Adds an annotation, and if is validated adds a validation flag.
 * The validation flag is only created once.
 */
export async function addAnnotation({
  userId,
  noteId,
  propertyName,
  value,
  isValidated,
}: {
  userId: User["id"];
  noteId: Note2["id"];
  propertyName: FieldsType;
  value: Annotation["value"];
  isValidated: boolean;
}) {
  if (isValidated) {
    const validatedAnnotation = await prisma.validatedAnnotation.findFirst({
      where: {
        propertyName,
        value,
        note2Id: noteId,
      },
    });

    if (!validatedAnnotation) {
      await prisma.validatedAnnotation.create({
        data: {
          propertyName,
          value,
          note2: {
            connect: {
              id: noteId,
            },
          },
        },
      });
    }
  }

  // prevent the user to add more than one annotation
  // for a specific property
  const previousAnnotation = await prisma.annotation.findFirst({
    where: {
      propertyName,
      value,
      note2Id: noteId,
      userId,
    },
  });

  if (previousAnnotation) return "previously_annotated";

  return prisma.annotation.create({
    data: {
      propertyName: propertyName,
      value,
      user: {
        connect: {
          id: userId,
        },
      },
      note2: {
        connect: {
          id: noteId,
        },
      },
    },
  });
}

/**
 * Increase unavailable note counter
 */
export async function increaseUnavailableCounterNote({
  noteId,
}: {
  noteId: Note2["id"];
}) {
  // get previous counter
  const noteInfoResult = await prisma.note2.findFirst({
    where: {
      id: noteId,
    },
    select: {
      isUnavailableCounter: true,
    },
  });

  // note not found
  if (noteInfoResult === null) return;

  return prisma.note2.update({
    data: {
      isUnavailableCounter: noteInfoResult.isUnavailableCounter + 1,
    },
    where: {
      id: noteId,
    },
  });
}
