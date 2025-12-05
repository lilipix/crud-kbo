import { z } from "zod";
import { ActivitySchema, CreateActivitySchema } from "./activities.validator";
import {
  CreateDenominationSchema,
  DenominationSchema,
} from "./denomination.validator";
import { ContactSchema, CreateContactSchema } from "./contact.validator";
import {
  CreateEstablishmentSchema,
  EstablishmentSchema,
} from "./establishment.validator";
import { AddressSchema, CreateAddressSchema } from "./addresses.validator";

export const EnterpriseSchema = z.object({
  enterpriseNumber: z.string(),
  status: z.string().nullable(),
  juridicalSituation: z.string().nullable(),
  typeOfEnterprise: z.string().nullable(),
  juridicalForm: z.string().nullable(),
  juridicalFormCAC: z.string().nullable(),
  startDate: z.string().nullable(),

  addresses: z.array(AddressSchema),
  activities: z.array(ActivitySchema),
  denominations: z.array(DenominationSchema),
  contacts: z.array(ContactSchema),
  establishments: z.array(EstablishmentSchema),
});

export const CreateEnterpriseSchema = z.object({
  enterpriseNumber: z.string().max(15),
  status: z.string().optional(),
  juridicalSituation: z.string().optional(),
  typeOfEnterprise: z.string().optional(),
  juridicalForm: z.string().optional(),
  juridicalFormCAC: z.string().optional(),
  startDate: z.string().optional(),
  addresses: z.array(CreateAddressSchema).optional(),
  activities: z.array(CreateActivitySchema).optional(),
  denominations: z.array(CreateDenominationSchema).optional(),
  contacts: z.array(CreateContactSchema).optional(),
  establishments: z.array(CreateEstablishmentSchema).optional(),
  activityCode: z.string().optional(),
});

export type CreateEnterpriseInput = z.infer<typeof CreateEnterpriseSchema>;

export const UpdateEnterpriseSchema = z.object({
  status: z.string().optional(),
  juridicalSituation: z.string().optional(),
  typeOfEnterprise: z.string().optional(),
  juridicalForm: z.string().optional(),
  juridicalFormCAC: z.string().optional(),
  startDate: z.string().optional(),
  addresses: z.array(CreateAddressSchema).optional(),
  activities: z.array(CreateActivitySchema).optional(),
  denominations: z.array(CreateDenominationSchema).optional(),
  contacts: z.array(CreateContactSchema).optional(),
  establishments: z.array(CreateEstablishmentSchema).optional(),
  activityCode: z.string().optional(),
});

export type UpdateEnterpriseInput = z.infer<typeof UpdateEnterpriseSchema>;
