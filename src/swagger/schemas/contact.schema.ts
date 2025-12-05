export const ContactSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    entityNumber: { type: "string" },
    entityContact: { type: "string", nullable: true },
    contactType: { type: "string", nullable: true },
    value: { type: "string", nullable: true },
  },
};
