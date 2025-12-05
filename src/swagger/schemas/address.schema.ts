export const AddressSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    typeOfAddress: { type: "string", nullable: true },
    countryFR: { type: "string", nullable: true },
    zipcode: { type: "string", nullable: true },
    streetFR: { type: "string", nullable: true },
    houseNumber: { type: "string", nullable: true },
    box: { type: "string", nullable: true },
    dateStrikingOff: { type: "string", nullable: true },
  },
};
