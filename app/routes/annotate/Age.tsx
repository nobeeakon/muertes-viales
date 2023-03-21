import { useState } from "react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";

import { addAnnotation } from "~/models/annotations.server";
import { getNote, getRandomNote } from "~/models/notes2.server";
import { validateNumber } from "~/utils";
import Annotate, { NoMoreToAnnotate } from "~/components/annotate";
import {
  FIELD_NAMES,
  validThreshold,
  omitValidThreshold,
  notAvailable,
} from "~/utils/constants";

const propertyName = FIELD_NAMES.victimAge;
const actionTypes = { annotate: "annotate", NA: "notAvailable" };
const validOptions = [
  { value: "child", display: "Niño" },
  { value: "young", display: "Joven" },
  { value: "adult", display: "Adulto" },
  { value: "old", display: "3a edad" },
];

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const ageString = formData.get(propertyName)?.toString();
  const noteId = formData.get("noteId")?.toString();
  const actionType = formData.get("actionType")?.toString() ?? "";

  // valid actions
  const actionTypesOptions = Object.values(actionTypes);
  if (!actionTypesOptions.includes(actionType) || !noteId) {
    return json(
      {
        errors: {
          age: "",
          request: "Invalid request 1",
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
      { errors: { age: "", request: "Invalid request 2", code: `age-02` } },
      { status: 400 }
    );
  }

  // NA
  if (actionType === actionTypes.NA) {
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
      propertyName: propertyName,
      value: notAvailable,
      isValidated: isOmitValidated,
    });

    return json(
      { errors: { age: "", request: "", code: `age-03` } },
      { status: 200 }
    );
  }

  if (!ageString) {
    return json(
      {
        errors: {
          age: "Age value is required",
          request: "",
          code: `age-04`,
        },
      },
      { status: 400 }
    );
  }

  // check valid inputs
  if (
    !validOptions.map((validItem) => validItem.value).includes(ageString) &&
    !validateNumber(ageString, 0)
  ) {
    return json(
      {
        errors: { age: "Age value is invalid 4", request: "", code: `age-05` },
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
  const randomNote = await getRandomNote(propertyName, userId);

  console.log("hola", randomNote);

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
    <Annotate title="Edad de la víctima" noteUrls={noteUrls}>
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
            <input name={propertyName} type="hidden" required value={age} />
            <input name="noteId" type="hidden" required value={note.id} />
            <button
              type="submit"
              name="actionType"
              value={actionTypes.annotate}
              disabled={!age.trim()}
              className="rounded bg-blue-500  py-1 px-3 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Guardar
            </button>
          </Form>
        </div>
        <Form replace reloadDocument method="post">
          <input name="noteId" type="hidden" required value={note.id} />

          <button
            type="submit"
            name="actionType"
            value={actionTypes.NA}
            className="py-2 px-4"
          >
            No dice
          </button>
        </Form>
      </div>
    </Annotate>
  );
}
