import type { ActionArgs } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/node";

import { requireUserId } from "~/session.server";

import { addAnnotation } from "~/models/annotations.server";
import { getNote } from "~/models/notes2.server";
import {
  omitValidThreshold,
  notAvailable,
  validateFieldName,
} from "~/utils/constants";

export const omitFieldNames = {
  noteId: "noteId",
  propertyName: "propertyName",
};

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const noteId = formData.get(omitFieldNames.noteId)?.toString();
  const propertyName = formData.get(omitFieldNames.propertyName)?.toString();

  // required input
  if (!noteId || !propertyName || !validateFieldName(propertyName)) {
    return json(
      {
        errors: {
          request: "Invalid request",
          code: `omit-01`,
        },
      },
      { status: 400 }
    );
  }

  // valid note
  const note = await getNote({ id: noteId });
  if (!note) {
    return json(
      {
        errors: {
          request: "Invalid request",
          code: `omit-02`,
        },
      },
      { status: 400 }
    );
  }

  // NA
  const isOmitValidated =
    note.annotations.filter(
      (annotationItem) =>
        annotationItem.propertyName === propertyName &&
        annotationItem.value === notAvailable
    ).length >=
    omitValidThreshold - 1; // -1 to account for the current annotation

  await addAnnotation({
    userId,
    noteId,
    propertyName,
    value: notAvailable,
    isValidated: isOmitValidated,
  });

  return redirect(request.headers.get("Referer") ?? "/annotate");
}
