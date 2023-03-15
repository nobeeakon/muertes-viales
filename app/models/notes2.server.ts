import type { User, Note2, NoteUrl } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Note2 } from "@prisma/client";

export function getNotes() {
  return prisma.note2.findMany();
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
  urls,
}: {
  userId: User["id"];
  urls: Array<NoteUrl["url"]>;
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
    },
  });

  return id;
}

export function deleteNote({ id }: Pick<Note2, "id">) {
  return prisma.note2.deleteMany({
    where: { id },
  });
}

const options = ["age", "name"] as const;

/**
 * Get a random note not previously annotated by the current user,
 * this is to prevent a single user to annotate multiple times the same note.
 */
export async function getRandomNote(
  property: (typeof options)[number],
  userId: string
) {
  const validatedNotes = await prisma.validatedAnnotation.findMany({
    select: {
      note2Id: true,
    },
    where: {
      propertyName: property,
    },
  });

  const userAnnotated = await prisma.annotation.findMany({
    select: {
      note2Id: true,
    },
    where: {
      propertyName: property,
    },
  });

  const validatedNoteIds = validatedNotes.map((item) => item.note2Id);
  const userAnnotatedNoteIds = userAnnotated.map((item) => item.note2Id);

  return prisma.note2.findFirst({
    select: {
      id: true,
      noteUrls: true,
    },
    where: {
      id: {
        notIn: [...validatedNoteIds, ...userAnnotatedNoteIds],
      },
    },
  });
}
