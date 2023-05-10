import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";

import { addAnnotation } from "~/models/annotations.server";
import { getNote, getRandomNote } from "~/models/notes.server";
import Annotate, { NoMoreToAnnotate } from "~/components/annotate";
import { FIELD_NAMES, validThreshold } from "~/utils/constants";
import OmitForms from "~/components/OmitForms";

const propertyName = FIELD_NAMES.accidentTime;
const timeValidOptions = Array.from(Array(24).keys()).map(
  (hourItem) => `${hourItem.toString()}:00`
);

const inputNames = {
  time: "time",
  noteId: "noteId",
};

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const noteId = formData.get(inputNames.noteId)?.toString();
  const time = formData.get(inputNames.time)?.toString();

  // required input
  if (!noteId || !time) {
    return json(
      {
        errors: {
          time: !time ? "Time is required" : "",
          request: !noteId ? "Invalid request" : "",
          code: `time-01`,
        },
      },
      { status: 400 }
    );
  }

  // valid note
  const note = await getNote({ id: noteId });
  if (!note) {
    return json(
      { errors: { time: "", request: "Invalid request", code: `time-02` } },
      { status: 400 }
    );
  }

  // check valid inputs
  if (!timeValidOptions.includes(time)) {
    return json(
      {
        errors: {
          time: "Transportation value is invalid",
          request: "",
          code: `time-03`,
        },
      },
      { status: 400 }
    );
  }

  const isValidated =
    note.annotations.filter(
      (annotationItem) =>
        annotationItem.propertyName === propertyName &&
        annotationItem.value === time
    ).length >=
    validThreshold - 1; // -1 to account for the current annotation

  await addAnnotation({
    userId,
    noteId,
    propertyName: propertyName,
    value: time,
    isValidated,
  });

  return json({ errors: { time: "", request: "", code: "" } }, { status: 200 });
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
    <Annotate
      title="Hora del accidente"
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
            <span className="mr-4">
              <label htmlFor="time" className="mr-2">
                Hora:
              </label>
              <select id="time" name={inputNames.time}>
                {timeValidOptions.map((timeItem) => (
                  <option key={timeItem} value={timeItem}>
                    {timeItem}
                  </option>
                ))}
              </select>
            </span>

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
