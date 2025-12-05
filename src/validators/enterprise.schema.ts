import { z } from "zod";

export const establishmentSchema = z.object({
  establishmentNumber: z.string(),
  startDate: z.string().optional(),
});

export const activitySchema = z.object({
  naceCode: z.string(),
  naceVersion: z.string().optional(),
  activityGroup: z.string().optional(),
  classification: z.string().optional(),
});

export const createEnterpriseSchema = z.object({
  enterpriseNumber: z.string(),
  status: z.string().optional(),
  juridicalSituation: z.string().optional(),
  typeOfEnterprise: z.string().optional(),
  juridicalForm: z.string().optional(),
  juridicalFormCAC: z.string().optional(),
  startDate: z.string().optional(),
  activity: activitySchema,
  establishments: z.array(establishmentSchema).optional(),
});

export type CreateEnterpriseInput = z.infer<typeof createEnterpriseSchema>;

export const updateEnterpriseSchema = z.object({
  status: z.string().optional(),
  juridicalSituation: z.string().optional(),
  typeOfEnterprise: z.string().optional(),
  juridicalForm: z.string().optional(),
  juridicalFormCAC: z.string().optional(),
  startDate: z.string().optional(),
  activity: activitySchema.optional(),
  establishments: z.array(establishmentSchema).optional(),
});

export type UpdateEnterpriseInput = z.infer<typeof updateEnterpriseSchema>;
