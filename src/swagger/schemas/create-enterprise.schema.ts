export const CreateEnterpriseSchema = {
  type: "object",
  required: ["enterpriseNumber", "activityCode"],
  properties: {
    enterpriseNumber: {
      type: "string",
      example: "0200.068.636",
      description: "Numéro unique de l'entreprise",
    },
    status: {
      type: "string",
      nullable: true,
      example: "AC",
      description: "Statut légal de l'entreprise",
    },
    juridicalSituation: {
      type: "string",
      nullable: true,
      example: "012",
    },
    typeOfEnterprise: {
      type: "string",
      nullable: true,
      example: "2",
    },
    juridicalForm: {
      type: "string",
      nullable: true,
      example: "417",
    },
    juridicalFormCAC: {
      type: "string",
      nullable: true,
      example: "",
    },
    startDate: {
      type: "string",
      format: "date",
      nullable: true,
      example: "2025-12-05",
    },
    activityCode: {
      type: "string",
      example: "01110",
      description:
        "Code NACE principal (doit exister dans la table des codes importée depuis les CSV)",
    },
    addresses: {
      type: "array",
      description: "Liste des adresses de l'entreprise",
      items: {
        type: "object",
        required: ["typeOfAddress", "zipcode"],
        properties: {
          typeOfAddress: { type: "string", example: "Office" },
          countryFR: { type: "string", example: "Belgique" },
          zipcode: { type: "string", example: "1000" },
          streetFR: { type: "string", example: "Rue Royale" },
          houseNumber: { type: "string", example: "12" },
          box: { type: "string", example: "B" },
          dateStrikingOff: { type: "string", nullable: true, example: "" },
        },
      },
    },
    activities: {
      type: "array",
      description: "Activités secondaires (optionnel)",
      items: {
        type: "object",
        properties: {
          activityGroup: { type: "string" },
          naceVersion: { type: "string" },
          naceCode: { type: "string" },
          classification: { type: "string" },
        },
      },
    },
    denominations: {
      type: "array",
      description: "Noms et abréviations de l'entreprise",
      items: {
        type: "object",
        required: ["denomination"],
        properties: {
          language: { type: "string", example: "FR" },
          typeOfDenomination: { type: "string", example: "LegalName" },
          denomination: {
            type: "string",
            example: "Société Exemple SPRL",
          },
        },
      },
    },
    contacts: {
      type: "array",
      description: "Contacts associés",
      items: {
        type: "object",
        properties: {
          entityContact: { type: "string", example: "Email" },
          contactType: { type: "string", example: "Professional" },
          value: { type: "string", example: "contact@exemple.com" },
        },
      },
    },
    establishments: {
      type: "array",
      description: "Succursales / unités d’établissement",
      items: {
        type: "object",
        required: ["establishmentNumber"],
        properties: {
          establishmentNumber: { type: "string", example: "123456789" },
          startDate: { type: "string", example: "2020-01-01" },
        },
      },
    },
  },
};
