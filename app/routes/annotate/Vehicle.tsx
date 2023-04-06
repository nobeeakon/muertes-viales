import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";

import { addAnnotation } from "~/models/annotations.server";
import { getNote, getRandomNote } from "~/models/notes2.server";
import Annotate, { NoMoreToAnnotate } from "~/components/annotate";
import { FIELD_NAMES, validThreshold } from "~/utils/constants";
import { omitFieldNames } from "./omit";

const propertyName = FIELD_NAMES.victimizerVehicle;
const validOptions = [
  { value: "automovil", display: "Automovil" },
  { value: "ambulancia", display: "Ambulancia" },
  { value: "bus", display: "Autobus (pasajeros)" },
  { value: "bicicleta", display: "Bicicleta" },
  { value: "caballo", display: "Caballo" },
  { value: "camion", display: "Camión (transporte mercancias)" },
  { value: "camioneta", display: "Camioneta" },
  { value: "carreta", display: "Carreta" },
  { value: "cuatrimoto", display: "Cuatrimoto" },
  { value: "grua", display: "Grúa" },
  { value: "taxi", display: "Taxi" },
  { value: "motocicleta", display: "Motocicleta" },
  { value: "patrulla", display: "Patrulla" },
  { value: "pipa", display: "Pipa" },
  { value: "tractor", display: "Tractor" },
  { value: "trailer", display: "Trailer" },
  { value: "tren", display: "Tren" },
  { value: "tren_ligero", display: "Tren ligero" },
];

const inputNames = {
  vehicle: "vehicle",
  noteId: "noteId",
};

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const noteId = formData.get(inputNames.noteId)?.toString();
  const transportation = formData.get(inputNames.vehicle)?.toString();

  // required input
  if (!noteId || !transportation) {
    return json(
      {
        errors: {
          transportation: !transportation ? "Vehicle is required" : "",
          request: !noteId ? "Invalid request" : "",
          code: `vehicle-01`,
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
          transportation: "",
          request: "Invalid request",
          code: `vehicle-02`,
        },
      },
      { status: 400 }
    );
  }

  // check valid inputs
  if (
    !validOptions.map((validItem) => validItem.value).includes(transportation)
  ) {
    return json(
      {
        errors: {
          transportation: "Vehicle value is invalid",
          request: "",
          code: `vehicle-03`,
        },
      },
      { status: 400 }
    );
  }

  const isValidated =
    note.annotations.filter(
      (annotationItem) =>
        annotationItem.propertyName === propertyName &&
        annotationItem.value === transportation
    ).length >=
    validThreshold - 1; // -1 to account for the current annotation

  await addAnnotation({
    userId,
    noteId,
    propertyName: propertyName,
    value: transportation,
    isValidated,
  });

  return json(
    { errors: { transportation: "", request: "", code: "" } },
    { status: 200 }
  );
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
    <Annotate title="Vehículo del victimario" noteUrls={noteUrls}>
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
                Vehículo:
              </label>
              <select id="time" name={inputNames.vehicle} required>
                {validOptions.map((vehicleItem) => (
                  <option key={vehicleItem.value} value={vehicleItem.value}>
                    {vehicleItem.display}
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
        <Form
          replace
          reloadDocument
          method="post"
          action="/annotate/addAnnotation"
        >
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
