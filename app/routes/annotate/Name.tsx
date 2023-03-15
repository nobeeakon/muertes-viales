import { useState } from "react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { Link } from "@remix-run/react";

import { addAnnotation } from "~/models/annotations.server";
import { getNote, getRandomNote, getNotes } from "~/models/notes2.server";
import {
  validThreshold,
  omitValidThreshold,
  notAvailable,
} from "~/utils/annotations";

const propertyName = "name";
const actionTypes = { annotate: "annotate", NA: "notAvailable" };

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const nameString = (formData.get(propertyName)?.toString() ?? "").trim();
  const actionType = formData.get("actionType")?.toString() ?? "";
  const noteId = formData.get("noteId")?.toString();

  const actionTypesOptions = Object.values(actionTypes);

  if (!actionTypesOptions.includes(actionType) || !noteId) {
    return json(
      {
        errors: {
          age: "",
          request: "Invalid request",
        },
      },
      { status: 400 }
    );
  }

  if (actionType === actionTypes.annotate && !nameString) {
    return json(
      {
        errors: {
          age: !nameString ? "Name is required" : "",
          request: "",
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

  if (actionType === actionTypes.NA) {
    const isOmitValidated =
      note.annotations.filter(
        (annotationItem) =>
          annotationItem.propertyName === propertyName &&
          annotationItem.value === notAvailable
      ).length >=
      omitValidThreshold - 1; // -1 to account for the current annotation

    return addAnnotation({
      userId,
      noteId,
      propertyName,
      value: notAvailable,
      isValidated: isOmitValidated,
    });
  }

  const isValidated =
    note.annotations.filter(
      (annotationItem) =>
        annotationItem.propertyName === propertyName &&
        annotationItem.value === nameString
    ).length >=
    validThreshold - 1; // -1 to account for the current annotation

  return addAnnotation({
    userId,
    noteId,
    propertyName,
    value: nameString,
    isValidated,
  });
}

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  const notes = await getNotes();
  const randomNote = await getRandomNote("name", userId);

  return { note: randomNote, totalNotesCount: notes.length };
}

export default function Age() {
  const [urlIndex, setUrlIndex] = useState(0);
  const { note, totalNotesCount } = useLoaderData<typeof loader>();

  if (!note?.id || !note.noteUrls)
    return (
      <div>
        <p>
          No hay más notas por anotar. <Link to="/annotate">Regresar </Link>
        </p>
        <p>{totalNotesCount} Anotadas </p>
      </div>
    );

  return (
    <div className="h-full">
      <h3>Edad</h3>
      <fieldset>
        <legend className="float-left">Notas:</legend>
        {note.noteUrls.map(({ url: urlItem }, index) => (
          <label key={urlItem}>
            <input
              name="urls"
              type="radio"
              value={index}
              onChange={(event) => setUrlIndex(parseInt(event.target.value))}
              checked={urlIndex === index}
            />
            {new URL(urlItem)?.host}
          </label>
        ))}
      </fieldset>
      <form method="post" >
        <div className="flex justify-around">
          <div>
            <label>
              Nombre de la víctima:
              <input type="string" name={propertyName} />
            </label>
          </div>
          <div></div>
          <div>
            <input name="noteId" type="hidden" value={note.id} />
            <button
              type="submit"
              name="actionType"
              value={actionTypes.annotate}
              className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Save
            </button>
            <button
              type="submit"
              name="actionType"
              value={actionTypes.NA}
              className="py-2 px-4"
            >
              No dice
            </button>
          </div>
        </div>
      </form>
      <div className="h-full">
        <iframe
          sandbox="true"
          width="100%"
          height="100%"
          title="noticia"
          src={note.noteUrls[urlIndex].url}
        ></iframe>
      </div>
    </div>
  );
}
