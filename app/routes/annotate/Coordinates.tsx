import { useState } from "react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";

import { addAnnotation } from "~/models/annotations.server";
import { getNote, getRandomNote } from "~/models/notes2.server";
import Annotate, { NoMoreToAnnotate } from "~/components/annotate";
import { FIELD_NAMES, validThreshold } from "~/utils/constants";
import { getGoogleMapsCoordiantes, haversineDistance } from "~/utils/utils";
import { validateUrl } from "~/utils";
import OmitForms from "~/components/OmitForms";

const propertyName = FIELD_NAMES.coordinates;
const inputNames = {
  googleMapsUrl: "googleMapsUrl",
};

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const googleMapsUrlString = formData
    .get(inputNames.googleMapsUrl)
    ?.toString();
  const noteId = formData.get("noteId")?.toString();

  // required input

  if (!noteId || !googleMapsUrlString) {
    return json(
      {
        errors: {
          coordinates: !googleMapsUrlString
            ? "Coordinates information is required"
            : "",
          request: !noteId ? "Invalid request" : "",
          code: `coordinates-01`,
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
          coordinates: "",
          request: "Invalid request",
          code: `coordinates-02`,
        },
      },
      { status: 400 }
    );
  }

  // check valid inputs
  const coordinates = getGoogleMapsCoordiantes(googleMapsUrlString ?? "");

  if (!validateUrl(googleMapsUrlString) || !coordinates) {
    return json(
      {
        errors: {
          coordinates: "Coordinates value is invalid",
          request: "",
          code: `coordinates-03`,
        },
      },
      { status: 400 }
    );
  }

  const DISTANCE_THRESHOLD = 500; // 500 meters

  const isValidated =
    note.annotations
      .map((annotationItem) => {
        if (annotationItem.propertyName !== propertyName) {
          return null;
        }

        return getGoogleMapsCoordiantes(googleMapsUrlString);
      })
      .filter((coordinatesItem) => {
        if (!coordinatesItem) return false;

        return (
          haversineDistance(coordinates, {
            latitude: coordinatesItem.latitude,
            longitude: coordinatesItem.longitude,
          }) <= DISTANCE_THRESHOLD
        );
      }).length >=
    validThreshold - 1; // -1 to account for the current annotation

  await addAnnotation({
    userId,
    noteId,
    propertyName: propertyName,
    value: googleMapsUrlString,
    isValidated: isValidated,
  });

  return json(
    { errors: { coordinates: "", request: "", code: "" } },
    { status: 200 }
  );
}

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const randomNote = await getRandomNote(propertyName, userId);

  return json({ note: randomNote });
}

export default function Age() {
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null); // latitude: N-S, longitude: E-W
  const { note } = useLoaderData<typeof loader>();

  const onGoogleMapsUrlChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newCoordinates = getGoogleMapsCoordiantes(event.target.value);

    setCoordinates(newCoordinates);
  };

  const noteId = note?.id;
  const noteUrls = note?.noteUrls;

  if (!noteId || !noteUrls)
    return (
      <div>
        <NoMoreToAnnotate />
      </div>
    );

  return (
    <Annotate title="Ubicación del accidente" noteUrls={noteUrls}>
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <div className="mr-2 flex  flex-wrap items-baseline gap-1">
          <div className="mr-3 flex flex-wrap items-baseline gap-2">
            <Form
              replace
              reloadDocument
              method="post"
              className=" flex flex-wrap items-baseline gap-2"
            >
              <div>
                <label htmlFor="google-url">Google maps</label>
                <input
                  id={"google-url"}
                  type="url"
                  name={inputNames.googleMapsUrl}
                  className="ml-2 rounded border border-gray-500 px-1 py-1"
                  required
                  autoFocus
                  onChange={onGoogleMapsUrlChange}
                />
              </div>

              <button
                type="submit"
                disabled={!coordinates?.latitude || !coordinates?.longitude}
                className="ml-2 rounded bg-blue-500 py-1 px-3 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:opacity-25"
              >
                Guardar
              </button>
              {!!coordinates?.latitude && !!coordinates?.longitude && (
                <a
                  href={`https://www.google.com/maps/?q=${coordinates.latitude},${coordinates.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-sky-500"
                >
                  Maps
                </a>
              )}
              {!!coordinates?.latitude && (
                <span>Latitude:&nbsp;{coordinates.latitude}</span>
              )}
              {!!coordinates?.longitude && (
                <span>Longitud:&nbsp;{coordinates.longitude}</span>
              )}

              <input name="noteId" type="hidden" required value={note.id} />
            </Form>
          </div>
        </div>
        <div className="flex">
          <OmitForms noteId={note.id} propertyName={propertyName} />
        </div>
      </div>
    </Annotate>
  );
}
