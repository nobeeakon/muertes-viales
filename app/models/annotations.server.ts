import type { User, Note2, Annotation } from "@prisma/client";
import { prisma } from "~/db.server";
import type { FieldsType } from "~/utils/constants";
import { omitValidThreshold } from "~/utils/constants";

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

  await prisma.annotation.create({
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

  return "annotated";
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

/**
 * Increase invalid (not relevant, or url not related with vial accidents) note counter
 */
export async function increaseInvalidCounterNote({
  noteId,
  userId,
}: {
  noteId: Note2["id"];
  userId: Note2["userId"];
}) {
  // get previous counter
  const noteInfoResult = await prisma.note2.findFirst({
    where: {
      id: noteId,
    },
    select: {
      invalidCounter: true,
    },
  });

  // note not found
  if (noteInfoResult === null) return;

  const newInvalidNoteInfoCounter = noteInfoResult.invalidCounter + 1;

  // update note
  await prisma.note2.update({
    data: {
      invalidCounter: newInvalidNoteInfoCounter,
    },
    where: {
      id: noteId,
    },
  });

  if (newInvalidNoteInfoCounter > omitValidThreshold) {
    // increase invalid notes counter
    const userInfoResult = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        invalidNotesCounter: true,
      },
    });

    // user not found
    if (!userInfoResult) return;

    await prisma.user.update({
      data: {
        invalidNotesCounter: userInfoResult.invalidNotesCounter + 1,
      },
      where: {
        id: userId,
      },
    });
  }

  return;
}
