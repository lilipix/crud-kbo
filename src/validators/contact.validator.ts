import { z } from "zod";

export const ContactSchema = z.object({
  id: z.number().int().positive().optional().openapi({
    example: 12,
    description: "Identifiant interne du contact",
  }),

  entityNumber: z.string().length(15).openapi({
    example: "0123.456.789",
    description: "Numéro d'entreprise lié à ce contact",
  }),

  entityContact: z.string().max(15).nullable().openapi({
    example: "TEL",
    description: "Type interne de contact (TEL/EMAIL/WEB...)",
  }),

  contactType: z.string().max(10).nullable().openapi({
    example: "PHONE",
    description: "Type de contact",
  }),

  value: z.string().max(200).nullable().openapi({
    example: "+32 2 123 45 67",
    description: "Valeur du contact (email, téléphone, site web...)",
  }),
});
export const CreateContactSchema = ContactSchema.omit({
  id: true,
  entityNumber: true,
});

export const UpdateContactSchema = ContactSchema.omit({
  id: true,
  entityNumber: true,
}).partial();

export type Contact = z.infer<typeof ContactSchema>;
