export const FIELD_NAMES = {
  victimAge: "victimAge",
  victimName: "victimName",
  victimSex: "victimSex",
  noteDate: 'noteDate',
} as const;

export type FieldsType = keyof typeof FIELD_NAMES;

//  annotation constants and thresholds
export const validThreshold = 1;
export const omitValidThreshold = validThreshold + 2;
export const notAvailable = "NA";
