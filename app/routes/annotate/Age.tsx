import { Fragment, useState } from "react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { Link } from "@remix-run/react";

import { addAnnotation } from "~/models/annotations.server";
import { getNote, getRandomNote, getNotes } from "~/models/notes2.server";
import { validateNumber } from "~/utils";
import { validThreshold } from "~/utils/annotations";

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
      <Form method="post">
        <div className="flex justify-around">
          <div>
            <label>
              Años{" "}
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
