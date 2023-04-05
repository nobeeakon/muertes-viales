import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";

import { addAnnotation } from "~/models/annotations.server";
import { getNote, getRandomNote } from "~/models/notes2.server";
import Annotate, { NoMoreToAnnotate } from "~/components/annotate";
import { FIELD_NAMES, validThreshold } from "~/utils/constants";

const propertyName = FIELD_NAMES.hasVictimizerInfo;
const validOptions = [
  { value: true, display: "Verdadero" },
  { value: false, display: "Falso" },
];

const inputNames = {
  hasVictimizerInfo: "hasVictimizerInfo",
  noteId: "noteId",
};

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const noteId = formData.get(inputNames.noteId)?.toString();
  const hasVictimizerString = formData
    .get(inputNames.hasVictimizerInfo)
    ?.toString();

  // required input
  if (!noteId || !hasVictimizerString) {
    return json(
      {
        errors: {
          hasVictimizerInfo: !hasVictimizerString
            ? "Victimizer info is required"
            : "",
          request: !noteId ? "Invalid request" : "",
          code: `hasVictimizerInfo-01`,
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
          hasVictimizerInfo: "",
          request: "Invalid request",
          code: `hasVictimizerInfo-02`,
        },
      },
      { status: 400 }
    );
  }

  // check valid inputs
  if (
    !validOptions
      .map((validItem) => validItem.value.toString())
      .includes(hasVictimizerString)
  ) {
    return json(
      {
        errors: {
          hasVictimizerInfo: "Victimizer info is invalid",
          request: "",
          code: `hasVictimizerInfo-03`,
        },
      },
      { status: 400 }
    );
  }

  const isValidated =
    note.annotations.filter(
      (annotationItem) =>
        annotationItem.propertyName === propertyName &&
        annotationItem.value === hasVictimizerString
    ).length >=
    validThreshold - 1; // -1 to account for the current annotation

  await addAnnotation({
    userId,
    noteId,
    propertyName: propertyName,
    value: hasVictimizerString,
    isValidated,
  });

  return json(
    { errors: { hasVictimizerInfo: "", request: "", code: "" } },
    { status: 200 }
  );
}

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const randomNote = await getRandomNote(propertyName, userId);

  return json({ note: randomNote });
}

export default function Age() {
  const { note } = useLoaderData<typeof loader>();

  const noteId = note?.id;
  const noteUrls = note?.noteUrls;

  if (!noteId || !noteUrls)
    return (
      <div>
        <NoMoreToAnnotate />
      </div>
    );

  return (
    <Annotate title="Información del victimario" noteUrls={noteUrls}>
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <div className="mr-2 flex  flex-wrap items-baseline gap-1">
          <Form
            replace
            reloadDocument
            method="post"
            className="flex items-baseline"
          >
            <fieldset>
              <legend className="float-left mr-2">
                Tiene información del responsable (edad, sexo):
              </legend>
              {validOptions.map((inputItem) => (
                <label key={inputItem.value.toString()} className="mr-2">
                  <input
                    name={propertyName}
                    type="radio"
                    value={inputItem.value.toString()}
                    required
                  />
                  {inputItem.display}
                </label>
              ))}
            </fieldset>

            <input
              name={inputNames.noteId}
              type="hidden"
              required
              value={note.id}
            />
            <button
              type="submit"
              className="ml-2 rounded bg-blue-500 py-1 px-3 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:opacity-25"
            >
              Guardar
            </button>
          </Form>
        </div>
      </div>
    </Annotate>
  );
}
