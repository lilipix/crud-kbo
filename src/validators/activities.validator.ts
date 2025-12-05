import { z } from "zod";

export const ActivitySchema = z.object({
  id: z.number(),
  entityNumber: z.string(),
  activityGroup: z.string().nullable(),
  naceVersion: z.string().nullable(),
  naceCode: z.string().nullable(),
  classification: z.string().nullable(),
});

export const CreateActivitySchema = z.object({
  activityGroup: z.string().optional(),
  naceVersion: z.string().optional(),
  naceCode: z.string().optional(),
  classification: z.string().optional(),
});
