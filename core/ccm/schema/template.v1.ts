export const TEMPLATE_V1_KEYS = [
  "metadata",
  "structure",
  "motion",
  "params",
  "runtime",
] as const;

export type TemplateV1Key = typeof TEMPLATE_V1_KEYS[number];

export const REQUIRED_METADATA_FIELDS = [
  "id",
  "version",
  "name",
  "engine",
] as const;

export const ALLOWED_VIEWPORTS = ["mobile", "desktop"] as const;

export const ALLOWED_MOTION_PROPERTIES = [
  "opacity",
  "translateX",
  "translateY",
  "scale",
  "rotate",
] as const;

export const ALLOWED_PARAM_TYPES = [
  "string",
  "number",
  "enum",
  "token",
  "preset",
  "asset",
] as const;
