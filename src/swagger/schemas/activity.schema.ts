export const ActivitySchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    entityNumber: { type: "string" },
    activityGroup: { type: "string", nullable: true },
    naceVersion: { type: "string", nullable: true },
    naceCode: { type: "string", nullable: true },
    classification: { type: "string", nullable: true },
  },
};
