import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const EstablishmentSchema = z.object({
  establishmentNumber: z.string(),
  startDate: z.string().nullable(),
});

export const CreateEstablishmentSchema = z.object({
  establishmentNumber: z.string(),
  startDate: z.string().optional(),
});

export type CreateEstablishmentInput = z.infer<
  typeof CreateEstablishmentSchema
>;

export const UpdateEstablishmentSchema = z.object({
  startDate: z.string().optional(),
});

export type UpdateEstablishmentInput = z.infer<
  typeof UpdateEstablishmentSchema
>;
