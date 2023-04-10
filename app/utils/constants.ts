export const FIELD_NAMES = {
  victimAge: "victimAge",
  victimName: "victimName",
  victimSex: "victimSex",
  victimTransportation: "victimTransportation",
  accidentDate: "accidentDate",
  accidentTime: "accidentTime",
  googleMapsUrl: "googleMapsUrl",
  hasVictimizerInfo: "hasVictimizerInfo",
  victimizerVehicle: "victimizerVehicle",
  victimizerSex: "victimizerSex",
  victimizerAge: "victimizerAge",
  unavailableNote: "unavailableNote",
} as const;

export type FieldsType = keyof typeof FIELD_NAMES;

/** Type guard to validate field name */
export const validateFieldName = (
  fieldName: string
): fieldName is FieldsType => {
  return Object.keys(FIELD_NAMES).includes(fieldName);
};

//  annotation constants and thresholds
export const validThreshold = 1;
export const omitValidThreshold = 2;
export const notAvailable = "NA";
export const blockUserDueToInvalidNotesThreshold = 5;

/** list of domains that block iframe, 'www.' is stripped */
export const blockedHosts = ["lineadirectaportal.com"];
