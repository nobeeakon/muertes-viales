import { Fragment, useState } from "react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";

import { addAnnotation } from "~/models/annotations.server";
import { getNote, getRandomNote, getNotes } from "~/models/notes2.server";
import { validateNumber } from "~/utils";
import { validThreshold } from "~/utils/annotations";
import Annotate, { NoMoreToAnnotate } from "~/components/annotate";

const validOptions = ["child", "young", "adult", "old"];
const propertyName = "age";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const ageString = formData.get(propertyName)?.toString();
  const noteId = formData.get("noteId")?.toString();

  if (!ageString || !noteId) {
    return json(
      {
        errors: {
          age: !ageString ? "Age value is required" : "",
          request: !noteId ? "Invalid request" : "",
        },
      },
      { status: 400 }
    );
  }

  const note = await getNote({ id: noteId });

  if (!note) {
    return json(
      { errors: { age: "", request: "Invalid request" } },
      { status: 400 }
    );
  }

  // check valid inputs
  if (!validOptions.includes(ageString) && !validateNumber(ageString, 0)) {
    return json(
      { errors: { age: "Age value is invalid", request: "" } },
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

  return addAnnotation({
    userId,
    noteId,
    propertyName,
    value: ageString,
    isValidated,
  });
}

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  const notes = await getNotes();
  const randomNote = await getRandomNote("age", userId);

  return { note: randomNote, totalNotesCount: notes.length };
}

export default function Age() {
  const [age, setAge] = useState("");
  const { note, totalNotesCount } = useLoaderData<typeof loader>();

  const noteId = note?.id;
  const noteUrls = note?.noteUrls;

  if (!noteId || !noteUrls)
    return (
      <div>
        <NoMoreToAnnotate totalNotesCount={totalNotesCount} />
      </div>
    );

  return (
    <Annotate title="Edad" noteUrls={noteUrls}>
      <Form method="post">
        <div className="flex justify-around">
          <div>
            <label>
              Años
              <input
                type="number"
                value={age}
                onChange={(event) => setAge(event.target.value)}
              />
            </label>
          </div>
          <div>
            <fieldset>
              <legend className="float-left">Opciones:</legend>
              {validOptions.map((optionItem) => (
                <Fragment key={optionItem}>
                  <input
                    type="radio"
                    id={`radio-${optionItem}`}
                    checked={age === optionItem}
                    onChange={() => setAge(optionItem)}
                  />
                  <label htmlFor={`radio-${optionItem}`}>{optionItem}</label>
                </Fragment>
              ))}
            </fieldset>
          </div>
          <div>
            <input name={propertyName} type="hidden" value={age} />
            <input name="noteId" type="hidden" value={note.id} />
            <button
              type="submit"
              className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Save
            </button>
          </div>
        </div>
      </Form>
    </Annotate>
  );
}
