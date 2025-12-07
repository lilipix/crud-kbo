import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const EstablishmentSchema = z.object({
  establishmentNumber: z
    .string()
    .regex(
      /^2\.[0-9]{3}\.[0-9]{3}\.[0-9]{3}$/,
      "Format invalide pour le numéro d'établissement"
    )
    .openapi({
      example: "2.123.456.789",
      description:
        "Numéro d'unité d'établissement au format BCE (commence toujours par 2)",
    }),

  enterpriseNumber: z.string().length(15).openapi({
    example: "0123.456.789",
    description: "Numéro d'entreprise auquel appartient l'établissement",
  }),

  startDate: z.coerce.date().nullable().openapi({
    type: "string",
    format: "date",
    example: "2021-06-01",
    description: "Date de début d'activité de l'établissement",
  }),
});

export const CreateEstablishmentSchema = EstablishmentSchema.omit({
  enterpriseNumber: true,
});

export const UpdateEstablishmentSchema = EstablishmentSchema.omit({
  establishmentNumber: true,
  enterpriseNumber: true,
}).partial();

export type Establishment = z.infer<typeof EstablishmentSchema>;
export type CreateEstablishmentInput = z.infer<
  typeof CreateEstablishmentSchema
>;
export type UpdateEstablishmentInput = z.infer<
  typeof UpdateEstablishmentSchema
>;
