import { z } from "../lib/zod-openapi";

import {
  ActivitySchema,
  CreateActivitySchema,
  UpdateActivitySchema,
} from "./activities.validator";
import {
  CreateDenominationSchema,
  DenominationSchema,
  UpdateDenominationSchema,
} from "./denomination.validator";
import {
  ContactSchema,
  CreateContactSchema,
  UpdateContactSchema,
} from "./contact.validator";
import {
  CreateEstablishmentSchema,
  EstablishmentSchema,
  UpdateEstablishmentSchema,
} from "./establishment.validator";
import {
  AddressSchema,
  CreateAddressSchema,
  UpdateAddressSchema,
} from "./addresses.validator";

export const EnterpriseBaseSchema = z.object({
  enterpriseNumber: z
    .string()
    .regex(/^\d{4}\.\d{3}\.\d{3}$/)
    .openapi({
      example: "0123.456.789",
      description: "Numéro d'entreprise belge au format 0000.000.000",
    }),
  status: z.enum(["AC", "ST"]).nullable().openapi({
    example: "AC",
    description: "Statut de l'entreprise (AC=Actif, ST=Arrêté)",
  }),
  juridicalSituation: z.string().max(3).nullable().openapi({ example: "000" }),
  typeOfEnterprise: z.string().length(1).nullable().openapi({ example: "2" }),
  juridicalForm: z.string().max(10).nullable().openapi({ example: "116" }),
  juridicalFormCAC: z.string().max(10).nullable().openapi({ example: "" }),
  startDate: z.coerce.date().nullable().openapi({
    type: "string",
    format: "date",
    example: "2020-01-15",
  }),
});

export const EnterpriseSchema = EnterpriseBaseSchema.extend({
  addresses: z.array(AddressSchema),
  activities: z.array(ActivitySchema),
  denominations: z.array(DenominationSchema),
  contacts: z.array(ContactSchema),
  establishments: z.array(EstablishmentSchema),
});

export const CreateEnterpriseSchema = EnterpriseBaseSchema.extend({
  establishments: z.array(CreateEstablishmentSchema).optional(),
  activities: z.array(CreateActivitySchema).optional(),
});

export const UpdateEnterpriseSchema = EnterpriseBaseSchema.omit({
  enterpriseNumber: true,
})
  .partial()
  .extend({
    establishments: z.array(UpdateEstablishmentSchema).optional(),
  });

export type Enterprise = z.infer<typeof EnterpriseSchema>;
export type CreateEnterprise = z.infer<typeof CreateEnterpriseSchema>;
export type UpdateEnterprise = z.infer<typeof UpdateEnterpriseSchema>;
