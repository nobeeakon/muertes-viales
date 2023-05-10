import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";

import { addAnnotation } from "~/models/annotations.server";
import {
  getNote,
  getRandomNoteHasVictimizerInfo,
} from "~/models/notes.server";
import Annotate, { NoMoreToAnnotate } from "~/components/annotate";
import { FIELD_NAMES, validThreshold } from "~/utils/constants";
import OmitForms from "~/components/OmitForms";

const propertyName = FIELD_NAMES.victimizerSex;
const validOptions = [
  { value: "hombre", display: "Hombre" },
  { value: "mujer", display: "Mujer" },
];

const inputNames = {
  sex: "sex",
  noteId: "noteId",
};

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const noteId = formData.get(inputNames.noteId)?.toString();
  const sexString = formData.get(inputNames.sex)?.toString();

  // required input
  if (!noteId || !sexString) {
    return json(
      {
        errors: {
          sex: !sexString ? "Sex is required" : "",
          request: !noteId ? "Invalid request" : "",
          code: `sex-01`,
        },
      },
      { status: 400 }
    );
  }

  // valid note
  const note = await getNote({ id: noteId });
  if (!note) {
    return json(
      { errors: { sex: "", request: "Invalid request", code: `sex-02` } },
      { status: 400 }
    );
  }

  // check valid inputs
  if (!validOptions.map((validItem) => validItem.value).includes(sexString)) {
    return json(
      {
        errors: { sex: "Sex value is invalid", request: "", code: `sex-03` },
      },
      { status: 400 }
    );
  }

  const isValidated =
    note.annotations.filter(
      (annotationItem) =>
        annotationItem.propertyName === propertyName &&
        annotationItem.value === sexString
    ).length >=
    validThreshold - 1; // -1 to account for the current annotation

  await addAnnotation({
    userId,
    noteId,
    propertyName: propertyName,
    value: sexString,
    isValidated,
  });

  return json({ errors: { sex: "", request: "", code: "" } }, { status: 200 });
}

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const randomNote = await getRandomNoteHasVictimizerInfo(propertyName, userId);

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
    <Annotate
      title="Sexo del victimario"
      noteUrls={noteUrls}
      noteId={noteId}
      noteObservations={note.comments}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <div className="mr-2 flex  flex-wrap items-baseline gap-1">
          <Form
            replace
            reloadDocument
            method="post"
            className="flex items-baseline"
          >
            <fieldset>
              <legend className="float-left mr-2">Sexo:</legend>
              {validOptions.map((inputItem) => (
                <label key={inputItem.value} className="mr-2">
                  <input
                    name={inputNames.sex}
                    type="radio"
                    value={inputItem.value}
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
        <div className="flex">
          <OmitForms noteId={note.id} propertyName={propertyName} />
        </div>
      </div>
    </Annotate>
  );
}
