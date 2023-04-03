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
import { validateNumber, validateUrl } from "~/utils";
import { omitFieldNames } from "./omit";

const propertyName = FIELD_NAMES.coordinates;
const inputNames = {
  googleMapsUrl: "googleMapsUrl",
  latitude: "latitude",
  longitude: "longitude",
};

type CoordinatesType = {
  latitude: number;
  longitude: number;
};

const dbCoords = {
  /** Builds string to store in the data base  */
  buildCoordsString: (googleMapsUrl: string, coordinates: CoordinatesType) => {
    return JSON.stringify({ googleMapsUrl, ...coordinates });
  },
  /** Parses string  stored in the data base  */
  parseCoords: (coordinates: string) => {
    try {
      const jsonObj = JSON.parse(coordinates) as unknown;

      if (typeof jsonObj === "object") {
        if (
          jsonObj !== null &&
          "googleMapsUrl" in jsonObj &&
          "latitude" in jsonObj &&
          "longitude" in jsonObj &&
          typeof jsonObj["googleMapsUrl"] === "string" &&
          typeof jsonObj["latitude"] === "number" &&
          typeof jsonObj["longitude"] === "number"
        ) {
          return {
            googleMapsUrl: jsonObj.googleMapsUrl,
            latitude: jsonObj.latitude,
            longitude: jsonObj.longitude,
          };
        }
      }
    } catch (error) {
      return null;
    }

    return null;
  },
};

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const googleMapsUrlString = formData
    .get(inputNames.googleMapsUrl)
    ?.toString();
  const latitudeString = formData.get(inputNames.latitude)?.toString();
  const longitudeString = formData.get(inputNames.longitude)?.toString();
  const noteId = formData.get("noteId")?.toString();

  // required input
  const hasIncompleteInfo =
    !latitudeString || !longitudeString || !googleMapsUrlString;
  if (!noteId || hasIncompleteInfo) {
    return json(
      {
        errors: {
          coordinates: hasIncompleteInfo
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
  if (
    !validateNumber(latitudeString) ||
    !validateNumber(longitudeString) ||
    !validateUrl(googleMapsUrlString)
  ) {
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

  const latitudeNumber = parseFloat(latitudeString);
  const longitudeNumber = parseFloat(longitudeString);

  const coordinatesObj = {
    latitude: latitudeNumber,
    longitude: longitudeNumber,
  };

  const DISTANCE_THRESHOLD = 500; // 500 meters

  const isValidated =
    note.annotations
      .map((annotationItem) => {
        if (annotationItem.propertyName !== propertyName) {
          return null;
        }

        return dbCoords.parseCoords(annotationItem.value);
      })
      .filter((coordinatesItem) => {
        if (!coordinatesItem) return false;

        const { latitude: itemLatitude, longitude: itemLongitude } =
          coordinatesItem;
        return (
          haversineDistance(coordinatesObj, {
            latitude: itemLatitude,
            longitude: itemLongitude,
          }) <= DISTANCE_THRESHOLD
        );
      }).length >=
    validThreshold - 1; // -1 to account for the current annotation

  const coordinatesString = dbCoords.buildCoordsString(googleMapsUrlString, {
    latitude: latitudeNumber,
    longitude: longitudeNumber,
  });

  await addAnnotation({
    userId,
    noteId,
    propertyName: propertyName,
    value: coordinatesString,
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
  const [coordinates, setCoordinates] = useState({ latitude: 0, longitude: 0 }); // latitude: N-S, longitude: E-W
  const { note } = useLoaderData<typeof loader>();

  const onGoogleMapsUrlChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const coordinates = getGoogleMapsCoordiantes(event.target.value);

    if (!coordinates) {
      setCoordinates({ latitude: 0, longitude: 0 });
    } else {
      setCoordinates(coordinates);
    }
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
    <Annotate title="Ubicación" noteUrls={noteUrls}>
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
                disabled={!coordinates.latitude || !coordinates.longitude}
                className="ml-2 rounded  bg-blue-500 py-1 px-3 text-white hover:bg-blue-600 focus:bg-blue-400"
              >
                Guardar
              </button>
              {!!coordinates.latitude && !!coordinates.longitude && (
                <a
                  href={`https://www.google.com/maps/?q=${coordinates.latitude},${coordinates.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Maps
                </a>
              )}
              {coordinates.latitude !== 0 && (
                <span>Latitude:&nbsp;{coordinates.latitude}</span>
              )}
              {coordinates.longitude !== 0 && (
                <span>Longitud:&nbsp;{coordinates.longitude}</span>
              )}

              <input
                value={coordinates.latitude}
                type="number"
                name={inputNames.latitude}
                required
                hidden
              />
              <input
                value={coordinates.longitude}
                type="number"
                name={inputNames.longitude}
                hidden
                required
              />
              <input name="noteId" type="hidden" required value={note.id} />
            </Form>
          </div>
        </div>
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

          <button type="submit" className="py-2 px-4">
            No dice
          </button>
        </Form>
      </div>
    </Annotate>
  );
}
