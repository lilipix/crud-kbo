export const DenominationSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    entityNumber: { type: "string" },
    language: { type: "string", nullable: true },
    typeOfDenomination: { type: "string", nullable: true },
    denomination: { type: "string", nullable: true },
  },
};
