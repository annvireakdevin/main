import { z } from "zod";

export const CATEGORIES = [
  "TOOL",
  "PROJECT",
  "RESEARCH",
  "BLOG",
  "EXPERIMENT",
] as const;
export const STATUSES = ["DRAFT", "PUBLISHED"] as const;
export const GRID_SIZES = ["SMALL", "MEDIUM", "WIDE", "TALL", "HERO"] as const;
export const ART_VARIANTS = ["TYPE", "TICKS", "RING", "GRID", "WAVE"] as const;
export const MEDIA_KINDS = ["IMAGE", "VIDEO", "PDF"] as const;

const optionalTrimmed = (max: number) =>
  z
    .string()
    .max(max)
    .transform((v) => v.trim())
    .optional()
    .or(z.literal(""));

export const projectInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "lowercase-with-dashes only"),
  summary: optionalTrimmed(2000),
  meta: optionalTrimmed(80),
  href: z
    .string()
    .max(500)
    .regex(/^(https?:\/\/|\/|#)/, "Must be a URL, /path, or #")
    .optional()
    .or(z.literal("")),
  category: z.enum(CATEGORIES),
  status: z.enum(STATUSES),
  gridSize: z.enum(GRID_SIZES),
  artVariant: z.enum(ART_VARIANTS),
  artText: optionalTrimmed(24),
  thumbnailId: z.string().max(64).optional().or(z.literal("")),
  galleryIds: z.array(z.string().max(64)).max(40).default([]),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

export const mediaInputSchema = z.object({
  kind: z.enum(MEDIA_KINDS),
  publicId: z.string().min(1).max(300),
  url: z.string().min(8).max(1000).regex(/^https:\/\//, "https URL required"),
  resourceType: z.string().max(20).default("image"),
  format: optionalTrimmed(20),
  bytes: z.number().int().nonnegative().default(0),
  width: z.number().int().positive().nullish(),
  height: z.number().int().positive().nullish(),
  alt: optionalTrimmed(200),
});

export type MediaInput = z.infer<typeof mediaInputSchema>;
