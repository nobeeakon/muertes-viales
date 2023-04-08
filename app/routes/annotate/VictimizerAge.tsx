import { useState } from "react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";

import { addAnnotation } from "~/models/annotations.server";
import {
  getNote,
  getRandomNoteHasVictimizerInfo,
} from "~/models/notes2.server";
import { validateNumericString } from "~/utils";
import Annotate, { NoMoreToAnnotate } from "~/components/annotate";
import { FIELD_NAMES, validThreshold } from "~/utils/constants";
import OmitForms from "~/components/OmitForms";

const propertyName = FIELD_NAMES.victimizerAge;
const validOptions = [
  { value: "child", display: "Niño" },
  { value: "young", display: "Joven" },
  { value: "adult", display: "Adulto" },
  { value: "old", display: "3a edad" },
];
const inputNames = {
  age: "age",
  noteId: "noteId",
};

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const ageString = formData.get(propertyName)?.toString();
  const noteId = formData.get("noteId")?.toString();

  // required input
  if (!noteId || !ageString) {
    return json(
      {
        errors: {
          age: !ageString ? "Age is required" : "",
          request: !noteId ? "Invalid request" : "",
          code: `age-01`,
        },
      },
      { status: 400 }
    );
  }

  // valid note
  const note = await getNote({ id: noteId });
  if (!note) {
    return json(
      { errors: { age: "", request: "Invalid request", code: `age-02` } },
      { status: 400 }
    );
  }

  // check valid inputs
  if (
    !validOptions.map((validItem) => validItem.value).includes(ageString) &&
    !validateNumericString(ageString, 0)
  ) {
    return json(
      {
        errors: { age: "Age value is invalid", request: "", code: `age-03` },
      },
      { status: 400 }
    );
  }

  const isValidated =
    note.annotations.filter(
      (annotationItem) =>
        annotationItem.propertyName === propertyName &&
        annotationItem.value === ageString
    ).length >=
    validThreshold - 1; // -1 to account for the current annotation

  await addAnnotation({
    userId,
    noteId,
    propertyName: propertyName,
    value: ageString,
    isValidated,
  });

  return json({ errors: { age: "", request: "", code: "" } }, { status: 200 });
}

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const randomNote = await getRandomNoteHasVictimizerInfo(propertyName, userId);

  return json({ note: randomNote });
}

export default function Age() {
  const [age, setAge] = useState("");
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
      title="Edad del victimario"
      noteUrls={noteUrls}
      noteId={noteId}
      noteObservations={note.comments}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <div className="mr-2 flex  flex-wrap items-baseline gap-1">
          <div className="mr-3">
            <label>
              Años
              <input
                className="ml-2 rounded border border-gray-500 px-1 py-1"
                type="number"
                value={age}
                autoFocus
                onChange={(event) => setAge(event.target.value)}
              />
            </label>
          </div>
          <div className="mr-2 flex" role="group" aria-labelledby="age-options">
            <div className="mr-2" id="age-options">
              Opciones:
            </div>
            {validOptions.map((optionItem) => (
              <label key={optionItem.value} className="mr-1">
                <input
                  type="radio"
                  checked={age === optionItem.value}
                  onChange={() => setAge(optionItem.value)}
                />

                {optionItem.display}
              </label>
            ))}
          </div>
          <Form replace reloadDocument method="post">
            <input name={inputNames.age} type="hidden" required value={age} />
            <input
              name={inputNames.noteId}
              type="hidden"
              required
              value={note.id}
            />
            <button
              type="submit"
              disabled={!age.trim()}
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
