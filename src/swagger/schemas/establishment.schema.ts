export const EstablishmentSchema = {
  type: "object",
  properties: {
    establishmentNumber: { type: "string" },
    startDate: { type: "string", nullable: true },
    enterpriseNumber: { type: "string" },
  },
};
