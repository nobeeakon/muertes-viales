import type { LoaderArgs } from "@remix-run/server-runtime";
import { requireUserId } from "~/session.server";
import { csv } from "~/utils/server/responses";

import { getAllValidNotes } from "~/models/notes2.server";
import { FIELD_NAMES } from "~/utils/constants";

type DataToCsvType = {
  noteDate: string;
  contributorName: string;
  noteUrls: string;
  victimName: string;
  victimSex: string;
  victimAge: string;
};

const urlsToCsvString = (urls: string[]) => {
  const urlsSeparator = " ||||| ";
  return urls.join(urlsSeparator);
};

const dateToCsvString = (date: Date) => {
  const isoDate = date.toISOString(); // TODO convert it to mexico's time zone

  // date iso string looks like: "2023-03-20T15:21:19.877Z"
  return isoDate.split("T")[0];
};

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request);
  // TODO limit the dowloads per day
  const notes = await getAllValidNotes();

  const fieldsOrder: Array<keyof DataToCsvType> = [
    "noteDate",
    "contributorName",
    "noteUrls",
    "victimAge",
    "victimName",
    "victimSex",
  ];

  const dataCsv = notes
    .map((noteItem) => {
      const noteDate = noteItem.createdAt;
      const contributorName = noteItem.user.email;
      const noteUrls = noteItem.noteUrls.map((urlItem) => urlItem.url);
      const victimName =
        noteItem.validatedAnnotations.find(
          (validatedItem) =>
            validatedItem.propertyName === FIELD_NAMES.victimName
        )?.value ?? "";
      const victimSex =
        noteItem.validatedAnnotations.find(
          (validatedItem) =>
            validatedItem.propertyName === FIELD_NAMES.victimSex
        )?.value ?? "";
      const victimAge =
        noteItem.validatedAnnotations.find(
          (validatedItem) =>
            validatedItem.propertyName === FIELD_NAMES.victimAge
        )?.value ?? "";

      const noteDataToCsv: DataToCsvType = {
        noteDate: dateToCsvString(noteDate),
        contributorName,
        noteUrls: urlsToCsvString(noteUrls),
        victimName,
        victimSex,
        victimAge,
      };

      return noteDataToCsv;
    })
    .map((noteToCsvItem) => {
      const dataRow: string[] = fieldsOrder.map(
        (fieldNameItem) => noteToCsvItem[fieldNameItem]
      );

      return dataRow;
    });

  const csvString = [fieldsOrder, ...dataCsv]
    .map((rowItem) => rowItem.toString())
    .join("\n");

  return csv(csvString, "muertesViales");
}
