import { z } from "zod";

export const AddressSchema = z.object({
  id: z.number().int().positive().optional().openapi({
    example: 45,
    description: "Identifiant interne de l'adresse",
  }),

  entityNumber: z.string().length(15).openapi({
    example: "0123.456.789",
    description: "Numéro d'entreprise lié à cette adresse",
  }),

  typeOfAddress: z.string().max(10).nullable().openapi({
    example: "HEAD",
    description: "Type d'adresse : siège, courrier, activité...",
  }),

  countryFR: z.string().max(100).nullable().openapi({
    example: "Belgique",
    description: "Pays en français",
  }),

  zipcode: z
    .string()
    .regex(/^[0-9]{4}$/)
    .nullable()
    .openapi({
      example: "1000",
      description: "Code postal belge (4 chiffres)",
    }),

  streetFR: z.string().max(200).nullable().openapi({
    example: "Rue du Marché",
    description: "Nom de la rue",
  }),

  houseNumber: z.string().max(10).nullable().openapi({
    example: "12",
    description: "Numéro de maison",
  }),

  box: z.string().max(10).nullable().openapi({
    example: "B2",
    description: "Boîte ou app. (optionnel)",
  }),

  dateStrikingOff: z.coerce.date().nullable().openapi({
    type: "string",
    format: "date",
    example: "2023-12-31",
    description: "Date de radiation de l'adresse",
  }),
});

export const CreateAddressSchema = AddressSchema.omit({
  id: true,
  entityNumber: true,
});

export const UpdateAddressSchema = AddressSchema.omit({
  id: true,
  entityNumber: true,
}).partial();

export type Address = z.infer<typeof AddressSchema>;
export type CreateAddress = z.infer<typeof CreateAddressSchema>;
