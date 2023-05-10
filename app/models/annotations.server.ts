import type { User, Note, Annotation } from "@prisma/client";
import { prisma } from "~/db.server";
import type { FieldsType } from "~/utils/constants";
import { omitValidThreshold } from "~/utils/constants";
import { getBlockedUserIds } from "./user.server";

export type {  Note } from "@prisma/client";

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
  noteId: Note["id"];
  propertyName: FieldsType;
  value: Annotation["value"];
  isValidated: boolean;
}) {
  if (isValidated) {
    const validatedAnnotation = await prisma.validatedAnnotation.findFirst({
      where: {
        propertyName,
        value,
        noteId: noteId,
      },
    });

    if (!validatedAnnotation) {
      await prisma.validatedAnnotation.create({
        data: {
          propertyName,
          value,
          note: {
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
      noteId: noteId,
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
      note: {
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
  noteId: Note["id"];
}) {
  // get previous counter
  const noteInfoResult = await prisma.note.findFirst({
    where: {
      id: noteId,
    },
    select: {
      isUnavailableCounter: true,
    },
  });

  // note not found
  if (noteInfoResult === null) return;

  return prisma.note.update({
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
  noteId: Note["id"];
  userId: Note["userId"];
}) {
  // get previous counter
  const noteInfoResult = await prisma.note.findFirst({
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
  await prisma.note.update({
    data: {
      invalidCounter: newInvalidNoteInfoCounter,
    },
    where: {
      id: noteId,
    },
  });

  if (newInvalidNoteInfoCounter > omitValidThreshold) {
    // increase user invalid notes counter
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

export async function getContributors() {
  const blockedUserIds = await getBlockedUserIds();

  const invalidNotes = await prisma.note.findMany({
    select: {
      id: true,
    },
    where: {
      invalidCounter: {
        gt: omitValidThreshold,
      },
    },
  });

  const invalidNoteIds = invalidNotes.map((noteItem) => noteItem.id);

  const annotators = await prisma.annotation.groupBy({
    by: ["userId"],
    _count: {
      userId: true
    },
    where: {
      userId: {
        notIn: blockedUserIds,
      },
      noteId: {
        notIn: invalidNoteIds,
      },
    },
    orderBy: {
      _count: {
        userId: "desc",
      },
    },
  });


  const userNames = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
    },
    where: {
      id: {
        in: annotators.map((userItem) => userItem.userId),
      },
    },
  });


  const annotatorIdsSorted = annotators.map((userItem) => userItem.userId);
  const usersMap = new Map(
    userNames.map((userItem) => [userItem.id, userItem.username])
  );


  return annotatorIdsSorted
    .map((userId) => usersMap.get(userId))
    .filter(usernameItem => usernameItem != null);
}
