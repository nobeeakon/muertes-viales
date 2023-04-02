import { useState } from "react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";

import { addAnnotation } from "~/models/annotations.server";
import { getNote, getRandomNote } from "~/models/notes2.server";
import Annotate, { NoMoreToAnnotate } from "~/components/annotate";
import {
  FIELD_NAMES,
  validThreshold,
  omitValidThreshold,
  notAvailable,
} from "~/utils/constants";

const propertyName = FIELD_NAMES.noteDate;
const actionTypes = { annotate: "annotate", NA: "notAvailable" };
const inputNames = {
  day: "day",
  month: "month",
  year: "year",
};

const MONTHS: Record<number, { month: string; days: number }> = {
  1: {
    month: "Enero",
    days: 31,
  },
  2: {
    month: "Febrero",
    days: 29,
  },
  3: {
    month: "Marzo",
    days: 31,
  },
  4: {
    month: "Abril",
    days: 30,
  },
  5: {
    month: "Mayo",
    days: 31,
  },
  6: {
    month: "Junio",
    days: 30,
  },
  7: {
    month: "Julio",
    days: 31,
  },
  8: {
    month: "Agosto",
    days: 31,
  },
  9: {
    month: "Septiembre",
    days: 30,
  },
  10: {
    month: "Octubre",
    days: 31,
  },
  11: {
    month: "Noviembre",
    days: 30,
  },
  12: {
    month: "Diciembre",
    days: 31,
  },
};
const YEARS = [2018, 2019, 2020, 2021, 2022, 2023];

const buildYMDString = (year: string, month: string, day: string) => {
  const monthString = month.padStart(2, "0");
  const dayString = day.padStart(2, "0");

  return `${year}-${monthString}-${dayString}`;
};

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const dayString = formData.get(inputNames.day)?.toString();
  const monthString = formData.get(inputNames.month)?.toString();
  const yearString = formData.get(inputNames.year)?.toString();
  const noteId = formData.get("noteId")?.toString();
  const actionType = formData.get("actionType")?.toString() ?? "";

  // valid actions
  const actionTypesOptions = Object.values(actionTypes);
  if (!actionTypesOptions.includes(actionType) || !noteId) {
    return json(
      {
        errors: {
          date: "",
          request: "Invalid request 1",
          code: `date-01`,
        },
      },
      { status: 400 }
    );
  }

  // valid note
  const note = await getNote({ id: noteId });
  if (!note) {
    return json(
      { errors: { date: "", request: "Invalid request 2", code: `date-02` } },
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
      { errors: { date: "", request: "", code: `date-03` } },
      { status: 200 }
    );
  }

  if (!dayString || !monthString || !yearString) {
    return json(
      {
        errors: {
          date: "Date value is required",
          request: "",
          code: `date-04`,
        },
      },
      { status: 400 }
    );
  }

  // check valid inputs
  const isValidYear = YEARS.includes(parseInt(yearString));
  const isValidMonth = Object.keys(MONTHS).includes(monthString);
  const isValidDay = isValidMonth
    ? parseInt(dayString) > 0 &&
      parseInt(dayString) <= MONTHS[parseInt(monthString)].days
    : false;

  if (!isValidYear || !isValidMonth || !isValidDay) {
    return json(
      {
        errors: {
          date: "Date value is invalid ",
          request: "",
          code: `date-05`,
        },
      },
      { status: 400 }
    );
  }

  const dateYMD = buildYMDString(yearString, monthString, dayString);

  const isValidated =
    note.annotations.filter(
      (annotationItem) =>
        annotationItem.propertyName === propertyName &&
        annotationItem.value === dateYMD
    ).length >=
    validThreshold - 1; // -1 to account for the current annotation

  await addAnnotation({
    userId,
    noteId,
    propertyName: propertyName,
    value: dateYMD,
    isValidated,
  });

  return json({ errors: { age: "", request: "", code: "" } }, { status: 200 });
}

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const randomNote = await getRandomNote(propertyName, userId);

  return json({ note: randomNote });
}

export default function Age() {
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(2023);
  const { note } = useLoaderData<typeof loader>();

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(event.target.value);

    if (day > MONTHS[newMonth].days) {
      setDay(1);
    }
    setMonth(newMonth);
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
    <Annotate title="Edad de la víctima" noteUrls={noteUrls}>
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <div className="mr-2 flex  flex-wrap items-baseline gap-1">
          <div className="mr-3">
            <Form replace method="post">
              <span className="mr-4">
                <label htmlFor="day" className="mr-2">
                  Día:
                </label>
                <select
                  id="day"
                  name={inputNames.day}
                  value={day}
                  onChange={(event) => setDay(parseInt(event.target.value))}
                >
                  {Array.from(
                    Array(MONTHS[month].days),
                    (_, index) => index + 1
                  ).map((dayItem) => (
                    <option key={dayItem} value={dayItem}>
                      {dayItem}
                    </option>
                  ))}
                </select>
              </span>
              <span className="mr-4">
                <label htmlFor="month" className="mr-2">
                  Mes:
                </label>
                <select
                  id="month"
                  name={inputNames.month}
                  value={month}
                  onChange={handleMonthChange}
                >
                  {Object.entries(MONTHS).map(([monthIndex, monthItem]) => (
                    <option key={monthItem.month} value={monthIndex}>
                      {monthItem.month}
                    </option>
                  ))}
                </select>
              </span>
              <span className="mr-4">
                <label htmlFor="year" className="mr-2">
                  Año:
                </label>
                <select
                  id="year"
                  value={year}
                  name={inputNames.year}
                  onChange={(event) => setYear(parseInt(event.target.value))}
                >
                  {YEARS.map((yearItem) => (
                    <option key={yearItem} value={yearItem}>
                      {yearItem}
                    </option>
                  ))}
                </select>
              </span>

              <input name="noteId" type="hidden" required value={note.id} />
              <button
                type="submit"
                name="actionType"
                value={actionTypes.annotate}
                disabled={!day || !month || !year}
                className="rounded bg-blue-500  py-1 px-3 text-white hover:bg-blue-600 focus:bg-blue-400"
              >
                Guardar
              </button>
            </Form>
          </div>
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
