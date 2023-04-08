import type { User, Note2, NoteUrl } from "@prisma/client";

import { prisma } from "~/db.server";
import { FIELD_NAMES, omitValidThreshold } from "~/utils/constants";
import type { FieldsType } from "~/utils/constants";
import { getBlockedUserIds } from "./user.server";

export type { Note2 } from "@prisma/client";

export async function getAllValidNotes() {
  const validatedNotesQueryResult = await prisma.validatedAnnotation.findMany({
    select: {
      note2Id: true,
    },
    distinct: ["note2Id"],
  });

  const validatedNoteIds = validatedNotesQueryResult.map(
    (validatedItem) => validatedItem.note2Id
  );

  return prisma.note2.findMany({
    select: {
      id: true,
      createdAt: true,
      userId: true,
      user: true,
      validatedAnnotations: true,
      noteUrls: true,
    },
    where: {
      id: {
        in: validatedNoteIds,
      },
    },
  });
}

export function getNote({ id }: Pick<Note2, "id">) {
  return prisma.note2.findFirst({
    include: {
      noteUrls: true,
      annotations: true,
      validatedAnnotations: true,
    },
    where: {
      id,
    },
  });
}

export function getUserNotes({ userId }: { userId: User["id"] }) {
  return prisma.note2.findMany({
    where: { userId: userId },
    include: {
      noteUrls: true,
    },
  });
}

export async function createNote({
  userId,
  customId,
  urls,
}: {
  userId: User["id"];
  urls: Array<NoteUrl["url"]>;
  customId?: Note2["customId"];
}) {
  const { id } = await prisma.note2.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      noteUrls: {
        create: urls.map((urlStringItem) => ({ url: urlStringItem })),
      },
      customId,
    },
  });

  return id;
}

export function deleteNote({ id }: Pick<Note2, "id">) {
  return prisma.note2.deleteMany({
    where: { id },
  });
}

function findValidatedNotes(property: FieldsType, userId: string) {
  return prisma.validatedAnnotation.findMany({
    select: {
      note2Id: true,
    },
    where: {
      propertyName: property,
    },
    distinct: ["note2Id"],
  });
}

function findUserAnnotatedNotes(property: FieldsType, userId: string) {
  return prisma.annotation.findMany({
    select: {
      note2Id: true,
    },
    where: {
      propertyName: property,
      userId,
    },
    distinct: ["note2Id"],
  });
}

/**
 * Get a random note not previously annotated by the current user,
 * this is to prevent a single user to annotate multiple times the same note.
 */
export async function getRandomNote(property: FieldsType, userId: string) {
  const validatedNotes = await findValidatedNotes(property, userId);
  const propertyUserAnnotated = await findUserAnnotatedNotes(property, userId);
  const blockedUserIds = await getBlockedUserIds();

  const validatedNoteIds = validatedNotes.map((item) => item.note2Id);
  const propertyUserAnnotatedNoteIds = propertyUserAnnotated.map(
    (item) => item.note2Id
  );

  return prisma.note2.findFirst({
    select: {
      id: true,
      noteUrls: true,
      comments: true,
    },
    where: {
      id: {
        notIn: [...validatedNoteIds, ...propertyUserAnnotatedNoteIds],
      },
      userId: {
        notIn: blockedUserIds,
      },
      isUnavailableCounter: {
        lte: omitValidThreshold,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

/**
 * Get a random note not previously annotated by the current user,
 * this is to prevent a single user to annotate multiple times the same note.
 */
export async function getRandomNoteHasVictimizerInfo(
  property: Extract<FieldsType, "victimizerSex" | "victimizerAge">,
  userId: string
) {
  const validatedNotes = await findValidatedNotes(property, userId);
  const propertyUserAnnotated = await findUserAnnotatedNotes(property, userId);
  const blockedUserIds = await getBlockedUserIds();

  const notesWithVictimizerInfo = await prisma.validatedAnnotation.findMany({
    select: {
      note2Id: true,
    },
    where: {
      propertyName: FIELD_NAMES.hasVictimizerInfo,
      value: true.toString(),
    },
    distinct: ["note2Id"],
  });

  const validatedNoteIds = validatedNotes.map((item) => item.note2Id);
  const propertyUserAnnotatedNoteIds = propertyUserAnnotated.map(
    (item) => item.note2Id
  );
  const withVictimizerInfoNoteIds = notesWithVictimizerInfo.map(
    (item) => item.note2Id
  );

  return prisma.note2.findFirst({
    select: {
      id: true,
      noteUrls: true,
      comments: true,
    },
    where: {
      id: {
        notIn: [...validatedNoteIds, ...propertyUserAnnotatedNoteIds],
        in: withVictimizerInfoNoteIds,
      },
      userId: {
        notIn: blockedUserIds,
      },
      isUnavailableCounter: {
        lte: omitValidThreshold,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function updateNoteComments(
  noteId: string,
  noteObservations: string
) {
  return prisma.note2.update({
    data: {
      comments: noteObservations,
    },
    where: {
      id: noteId,
    },
  });
}
