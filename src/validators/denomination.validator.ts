import { z } from "zod";

export const DenominationSchema = z.object({
  id: z.number().int().positive().optional().openapi({
    example: 87,
    description: "Identifiant interne de la dénomination",
  }),

  entityNumber: z.string().length(15).openapi({
    example: "0123.456.789",
    description: "Numéro d'entreprise lié à cette dénomination",
  }),

  language: z.enum(["FR", "NL", "DE"]).nullable().openapi({
    example: "FR",
    description: "Langue de la dénomination",
  }),

  typeOfDenomination: z.string().max(10).nullable().openapi({
    example: "OFFICIAL",
    description: "Type : officiel, commercial, abrégé...",
  }),

  denomination: z.string().max(300).nullable().openapi({
    example: "Ma Société SRL",
    description: "Nom ou raison sociale",
  }),
});

export const CreateDenominationSchema = DenominationSchema.omit({
  id: true,
  entityNumber: true,
});

export const UpdateDenominationSchema = DenominationSchema.omit({
  id: true,
  entityNumber: true,
}).partial();
