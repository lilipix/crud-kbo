export const CreateEstablishmentSchema = {
  type: "object",
  required: ["establishmentNumber"],
  properties: {
    establishmentNumber: {
      type: "string",
      example: "0123456789",
      description: "Unique establishment identifier",
    },
    startDate: {
      type: "string",
      nullable: true,
      example: "2020-01-01",
      description: "Date when the establishment became active",
    },
  },
};
