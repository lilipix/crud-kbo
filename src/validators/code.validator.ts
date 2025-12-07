import { z } from "zod";

export const CodeSchema = z.object({
  code: z.string().max(20),
  category: z.string().max(50).nullable(),
  language: z.enum(["FR", "NL", "DE", "EN"]).nullable().or(z.null()),
  description: z.string().max(500).nullable(),
});

export type Code = z.infer<typeof CodeSchema>;
