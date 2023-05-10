import type { ActionArgs } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/node";

import { requireUserId } from "~/session.server";

import {
  addAnnotation,
  increaseUnavailableCounterNote,
  increaseInvalidCounterNote,
} from "~/models/annotations.server";
import { getNote } from "~/models/notes.server";
import {
  omitValidThreshold,
  notAvailable,
  validateFieldName,
} from "~/utils/constants";

export const actionType = {
  unavailableProperty: "unavailableProperty",
  unavailableNote: "unavailableNote",
  invalidNote: "invalidNote",
};

export const omitFieldNames = {
  noteId: "noteId",
  actionType: "actionType",
  propertyName: "propertyName",
};

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const redirectTo = request.headers.get("Referer") ?? "/annotate";

  const noteId = formData.get(omitFieldNames.noteId)?.toString();
  const actionTypeString = formData.get(omitFieldNames.actionType)?.toString();
  const propertyName = formData.get(omitFieldNames.propertyName)?.toString();

  // required input
  const invalidRequestJsonResponse = (errorCodeNumber: number) =>
    json(
      {
        errors: {
          request: "Invalid request",
          code: `omit-${errorCodeNumber}`,
        },
      },
      { status: 400 }
    );

  if (
    !noteId ||
    !actionTypeString ||
    !Object.values(actionType).includes(actionTypeString)
  ) {
    return invalidRequestJsonResponse(1);
  }

  // valid note
  const note = await getNote({ id: noteId });
  if (!note) {
    return invalidRequestJsonResponse(2);
  }
  if (!propertyName || !validateFieldName(propertyName)) {
    return invalidRequestJsonResponse(3);
  }

  // NA
  const isNAValidated =
    note.annotations.filter(
      (annotationItem) =>
        annotationItem.propertyName === propertyName &&
        annotationItem.value === notAvailable
    ).length >=
    omitValidThreshold - 1; // -1 to account for the current annotation

  const annotationResult = await addAnnotation({
    userId,
    noteId,
    propertyName,
    value: notAvailable,
    isValidated: isNAValidated,
  });

  if (
    actionTypeString === actionType.unavailableNote &&
    annotationResult === "annotated"
  ) {
    await increaseUnavailableCounterNote({
      noteId,
    });
  }

  if (
    actionTypeString === actionType.invalidNote &&
    annotationResult === "annotated"
  ) {
    await increaseInvalidCounterNote({
      noteId,
      userId,
    });
  }

  return redirect(redirectTo);
}
