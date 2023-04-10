import type { LoaderArgs } from "@remix-run/server-runtime";
import { requireUserId } from "~/session.server";
import { csv } from "~/utils/server/responses";

import { getAllValidNotes } from "~/models/notes2.server";
import { FIELD_NAMES } from "~/utils/constants";
import type { FieldsType } from "~/utils/constants";
import { getGoogleMapsCoordiantes } from "~/utils/utils";

type AnnotatedDataType = {
  [FieldName in FieldsType]: string;
};

type GoogleMapsUrlDerivedInfo = {
  latitude: string;
  longitude: string;
};

type DataToCsvType = {
  noteDate: string;
  contributorName: string;
  noteUrls: string;
  noteObservations: string;
} & AnnotatedDataType &
  GoogleMapsUrlDerivedInfo;

const CSV_STRING_DELIMITER = `"`;

const urlsToCsvString = (urls: string[]) => {
  const URLS_SEPARATOR = " ||||| ";
  return `${CSV_STRING_DELIMITER}${urls.join(
    URLS_SEPARATOR
  )}${CSV_STRING_DELIMITER}`;
};

const dateToCsvString = (date: Date) => {
  const isoDate = date.toISOString(); // TODO convert it to mexico's time zone

  // date iso string looks like: "2023-03-20T15:21:19.877Z"
  return isoDate.split("T")[0];
};

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request);
  // TODO limit the downloads per day
  const notes = await getAllValidNotes();

  const fieldsOrder: Array<keyof DataToCsvType> = [
    "noteDate",
    "contributorName",
    "noteObservations",
    "noteUrls",
    "victimAge",
    "victimName",
    "victimSex",
    "victimTransportation",
    "accidentDate",
    "accidentTime",
    "googleMapsUrl",
    "latitude",
    "longitude",
    "hasVictimizerInfo",
    "victimizerVehicle",
    "victimizerSex",
    "victimizerAge",
    "unavailableNote",
  ];

  const dataCsv = notes
    .map((noteItem) => {
      const noteDate = noteItem.createdAt;
      const contributorName = noteItem.user.email;
      const noteObservations = noteItem.comments;
      const noteUrls = noteItem.noteUrls.map((urlItem) => urlItem.url);

      const validatedPropertiesMap = new Map(
        noteItem.validatedAnnotations.map((validatedItem) => [
          validatedItem.propertyName,
          validatedItem.value,
        ])
      );

      const coordinates = getGoogleMapsCoordiantes(
        validatedPropertiesMap.get(FIELD_NAMES.googleMapsUrl) ?? ""
      );

      const googleMapsUrlString = !validatedPropertiesMap.get(
        FIELD_NAMES.googleMapsUrl
      )
        ? ""
        : `${CSV_STRING_DELIMITER}${
            validatedPropertiesMap.get(FIELD_NAMES.googleMapsUrl) ?? ""
          }${CSV_STRING_DELIMITER}`;

      const noteDataToCsv: DataToCsvType = {
        noteDate: dateToCsvString(noteDate),
        contributorName,
        noteObservations,
        noteUrls: urlsToCsvString(noteUrls),

        victimAge: validatedPropertiesMap.get(FIELD_NAMES.victimAge) ?? "",
        victimName: validatedPropertiesMap.get(FIELD_NAMES.victimName) ?? "",
        victimSex: validatedPropertiesMap.get(FIELD_NAMES.victimSex) ?? "",
        victimTransportation:
          validatedPropertiesMap.get(FIELD_NAMES.victimTransportation) ?? "",

        accidentDate:
          validatedPropertiesMap.get(FIELD_NAMES.accidentDate) ?? "",
        accidentTime:
          validatedPropertiesMap.get(FIELD_NAMES.accidentTime) ?? "",

        googleMapsUrl: googleMapsUrlString,
        latitude: coordinates?.latitude.toString() ?? "",
        longitude: coordinates?.longitude.toString() ?? "",

        hasVictimizerInfo:
          validatedPropertiesMap.get(FIELD_NAMES.hasVictimizerInfo) ?? "",
        victimizerVehicle:
          validatedPropertiesMap.get(FIELD_NAMES.victimizerVehicle) ?? "",
        victimizerSex:
          validatedPropertiesMap.get(FIELD_NAMES.victimizerSex) ?? "",
        victimizerAge:
          validatedPropertiesMap.get(FIELD_NAMES.victimizerAge) ?? "",

        unavailableNote:
          validatedPropertiesMap.get(FIELD_NAMES.unavailableNote) ?? "",
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
