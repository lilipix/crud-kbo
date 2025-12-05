export const UpdateEstablishmentSchema = {
  type: "object",
  properties: {
    startDate: {
      type: "string",
      nullable: true,
      example: "2022-05-12",
      description: "Updated start date of the establishment",
    },
    // Si tu veux permettre de changer l'entreprise :
    enterpriseNumber: {
      type: "string",
      nullable: true,
      example: "0201.183.146",
      description: "Enterprise number to reassign the establishment",
    },
  },
};
