export const UpdateEnterpriseSchema = {
  type: "object",
  properties: {
    status: { type: "string", nullable: true },
    juridicalSituation: { type: "string", nullable: true },
    typeOfEnterprise: { type: "string", nullable: true },
    juridicalForm: { type: "string", nullable: true },
    juridicalFormCAC: { type: "string", nullable: true },
    startDate: { type: "string", format: "date", nullable: true },
  },
};
