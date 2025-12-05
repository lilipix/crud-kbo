import { z } from "zod";

export const DenominationSchema = z.object({
  id: z.number(),
  entityNumber: z.string(),
  language: z.string().nullable(),
  typeOfDenomination: z.string().nullable(),
  denomination: z.string().nullable(),
});

export const CreateDenominationSchema = z.object({
  language: z.string().optional(),
  typeOfDenomination: z.string().optional(),
  denomination: z.string().optional(),
});
