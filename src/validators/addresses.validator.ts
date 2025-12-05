import { z } from "zod";

export const AddressSchema = z.object({
  id: z.number(),
  entityNumber: z.string(),
  typeOfAddress: z.string().nullable(),
  countryFR: z.string().nullable(),
  zipcode: z.string().nullable(),
  streetFR: z.string().nullable(),
  houseNumber: z.string().nullable(),
  box: z.string().nullable(),
  dateStrikingOff: z.string().nullable(),
});

export const CreateAddressSchema = z.object({
  typeOfAddress: z.string().optional(),
  countryFR: z.string().optional(),
  zipcode: z.string().optional(),
  streetFR: z.string().optional(),
  houseNumber: z.string().optional(),
  box: z.string().optional(),
  dateStrikingOff: z.string().optional(),
});
