import { z } from "zod";

export const ActivitySchema = z.object({
  id: z.number().int().positive().optional().openapi({
    example: 123,
    description: "Identifiant interne de l'activité",
  }),

  entityNumber: z.string().length(15).openapi({
    example: "0123.456.789",
    description: "Numéro d'entreprise lié à cette activité",
  }),

  activityGroup: z.string().max(10).nullable().openapi({
    example: "G471",
    description: "Groupe d'activité BCE (peut être nul)",
  }),

  naceVersion: z.string().max(10).nullable().openapi({
    example: "2025",
    description: "Version de la nomenclature NACE",
  }),

  naceCode: z.string().max(8).openapi({
    example: "47111",
    description: "Code NACE identifiant l'activité économique",
  }),

  classification: z.string().max(10).nullable().openapi({
    example: "MAIN",
    description: "Classification de l'activité (MAIN / SECO / HIST)",
  }),
});

export const CreateActivitySchema = ActivitySchema.omit({
  id: true,
  entityNumber: true,
  naceVersion: true,
});
export const UpdateActivitySchema = ActivitySchema.omit({
  id: true,
  entityNumber: true,
  naceVersion: true,
}).partial();

export type Activity = z.infer<typeof ActivitySchema>;
export type CreateActivity = z.infer<typeof CreateActivitySchema>;
