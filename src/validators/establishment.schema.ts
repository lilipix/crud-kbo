import { z } from "zod";

export const createEstablishmentSchema = z.object({
  establishmentNumber: z.string(),
  startDate: z.string().optional(),
});

export type CreateEstablishmentInput = z.infer<
  typeof createEstablishmentSchema
>;

export const updateEstablishmentSchema = z.object({
  startDate: z.string().optional(),
});

export type UpdateEstablishmentInput = z.infer<
  typeof updateEstablishmentSchema
>;
