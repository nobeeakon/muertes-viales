import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";

import { addAnnotation } from "~/models/annotations.server";
import { getNote, getRandomNote } from "~/models/notes2.server";
import { FIELD_NAMES, validThreshold } from "~/utils/constants";
import Annotate, { NoMoreToAnnotate } from "~/components/annotate";
import { omitFieldNames } from "./omit";

const propertyName = FIELD_NAMES.victimName;

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const nameString = (formData.get(propertyName)?.toString() ?? "").trim();
  const noteId = formData.get("noteId")?.toString();

  // required input
  if (!noteId || !nameString) {
    return json(
      {
        errors: {
          name: !nameString ? "Name is required" : "",
          request: !noteId ? "Invalid request" : "",
          code: `name-01`,
        },
      },
      { status: 400 }
    );
  }

  // valid note
  const note = await getNote({ id: noteId });
  if (!note) {
    return json(
      { errors: { name: "", request: "Invalid request", code: `name-02` } },
      { status: 400 }
    );
  }

  const sanitizeName = (name: string) => {
    return name.replace(/\s+/g, " ").toLocaleLowerCase();
  };

  const isValidated =
    note.annotations.filter(
      (annotationItem) =>
        annotationItem.propertyName === propertyName &&
        sanitizeName(annotationItem.value) === sanitizeName(nameString)
    ).length >=
    validThreshold - 1; // -1 to account for the current annotation

  await addAnnotation({
    userId,
    noteId,
    propertyName: propertyName,
    value: nameString,
    isValidated,
  });

  return json({ errors: { name: "", request: "", code: "" } }, { status: 200 });
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
    <Annotate title="Nombre de la víctima" noteUrls={noteUrls}>
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <Form replace reloadDocument method="post">
          <div className="flex  items-baseline">
            <label>
              Nombre de la víctima:
              <input
                type="string"
                name={propertyName}
                autoFocus
                required
                className="ml-2 rounded border border-gray-500 px-1 py-1"
              />
            </label>
            <input name="noteId" type="hidden" required value={noteId} />
            <button
              type="submit"
              className="ml-2 rounded disabled:opacity-25 bg-blue-500 py-1 px-3 text-white hover:bg-blue-600 focus:bg-blue-400"
              >
              Guardar
            </button>
          </div>
        </Form>
        <Form replace reloadDocument method="post" action="/annotate/omit">
          <input
            value={note.id}
            name={omitFieldNames.noteId}
            type="hidden"
            required
          />
          <input
            value={propertyName}
            name={omitFieldNames.propertyName}
            type="hidden"
            required
          />

          <button
            type="submit"
            className="ml-2 rounded border  border-blue-500 py-1 px-3 hover:bg-blue-600 hover:text-white focus:bg-blue-400"
          >
            No dice
          </button>
        </Form>
      </div>
    </Annotate>
  );
}
