import { AddressSchema } from "./address.schema";
import { ActivitySchema } from "./activity.schema";
import { ContactSchema } from "./contact.schema";
import { EstablishmentSchema } from "./establishment.schema";
import { DenominationSchema } from "./denomination.schema";

export const EnterpriseSchema = {
  type: "object",
  properties: {
    enterpriseNumber: { type: "string" },
    status: { type: "string", nullable: true },
    juridicalSituation: { type: "string", nullable: true },
    typeOfEnterprise: { type: "string", nullable: true },
    juridicalForm: { type: "string", nullable: true },
    juridicalFormCAC: { type: "string", nullable: true },
    startDate: { type: "string", nullable: true },

    addresses: {
      type: "array",
      items: AddressSchema,
    },
    activities: {
      type: "array",
      items: ActivitySchema,
    },
    denominations: {
      type: "array",
      items: DenominationSchema,
    },
    contacts: {
      type: "array",
      items: ContactSchema,
    },
    establishments: {
      type: "array",
      items: EstablishmentSchema,
    },
  },
};
