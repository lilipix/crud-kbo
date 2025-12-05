import { z } from "zod";

export const ContactSchema = z.object({
  id: z.number(),
  entityNumber: z.string(),
  entityContact: z.string().nullable(),
  contactType: z.string().nullable(),
  value: z.string().nullable(),
});

export const CreateContactSchema = z.object({
  entityContact: z.string().optional(),
  contactType: z.string().optional(),
  value: z.string().optional(),
});
