import type { ActionArgs } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/node";

import { requireUserId } from "~/session.server";

import { getNote, updateNoteComments } from "~/models/notes2.server";

export const commentFieldNames = {
  noteId: "noteId",
  noteObservations: "noteObservations",
};

export async function action({ request }: ActionArgs) {
  await requireUserId(request);

  const formData = await request.formData();
  const redirectTo = request.headers.get("Referer") ?? "/annotate";

  const noteId = formData.get(commentFieldNames.noteId)?.toString();
  const noteObservations = formData
    .get(commentFieldNames.noteObservations)
    ?.toString();

  // invalid Request
  const invalidRequestJsonResponse = (errorCodeNumber: number) =>
    json(
      {
        errors: {
          request: "Invalid request",
          code: `comment-${errorCodeNumber}`,
        },
      },
      { status: 400 }
    );

  if (!noteId || noteObservations === undefined) {
    return invalidRequestJsonResponse(1);
  }

  // valid note
  const note = await getNote({ id: noteId });
  if (!note) {
    return invalidRequestJsonResponse(2);
  }

  await updateNoteComments(noteId, noteObservations);

  return redirect(redirectTo);
}
