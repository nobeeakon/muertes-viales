import { validateUrl } from "~/utils";

/** Extract pin coordinates from google maps url */
export const getGoogleMapsCoordiantes = (
  googleMapsUrl: string
): null | { latitude: number; longitude: number } => {
  const isValidUrl = validateUrl(googleMapsUrl);

  if (!isValidUrl) return null;

  const mapsUrl = new URL(googleMapsUrl);
  // example google maps url https://www.google.com/maps/place/20%C2%B035'05.5%22N+100%C2%B024'15.9%22W/@20.5848626,-100.4066228,17z/data=!3m1!4b1!4m5!3m4!1s0x0:0x2e1789a4ae40a179!8m2!3d20.5848576!4d-100.4044288
  // the part that matters is data=...!3d20.5848576!4d-100.4044288
  // in this case 20.5848576 is latitude, and -100.4044288 is longitude
  // @ is the center, NOT the pin position https://stackoverflow.com/a/58993992
  // https://stackoverflow.com/questions/57256671/how-do-i-get-the-address-and-coordinates-given-this-google-place-url
  const dataUrl = mapsUrl.pathname
    .split("/")
    .find((ii) => ii.startsWith("data"));

  const latitudeUrlString =
    dataUrl
      ?.split("!")
      .find((dataItem) => dataItem.startsWith("3d"))
      ?.replace("3d", "") ?? "";
  const longitudeUrlString =
    dataUrl
      ?.split("!")
      .find((dataItem) => dataItem.startsWith("4d"))
      ?.replace("4d", "") ?? "";

  const latitude = parseFloat(latitudeUrlString);
  const longitude = parseFloat(longitudeUrlString);

  // parseFloat('') returns NaN
  if (!isNaN(latitude) && !isNaN(latitude)) {
    return { latitude, longitude };
  }

  return null;
};

type CoordinatesType = {
  latitude: number;
  longitude: number;
};
/**
 * Calculate Haversine distance (meters) between to coordinates
 * https://en.wikipedia.org/wiki/Haversine_formula
 * @returns distance in meters
 */
export function haversineDistance(
  coordinatesA: CoordinatesType,
  coordinatesB: CoordinatesType
) {
  const rad = Math.PI / 180;
  const MeanEarthRadius = 6371000;

  const lat1 = coordinatesA.latitude * rad;
  const lat2 = coordinatesB.latitude * rad;
  const sinDLat = Math.sin(
    ((coordinatesB.latitude - coordinatesA.latitude) * rad) / 2
  );
  const sinDLon = Math.sin(
    ((coordinatesB.longitude - coordinatesA.longitude) * rad) / 2
  );
  const a =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return MeanEarthRadius * c;
}
