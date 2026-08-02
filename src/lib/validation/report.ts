import { z } from "zod";
import { REPORT_REASONS_BY_TARGET, type ReportTargetType } from "@/config/reports";

const targetTypeSchema = z.enum(["LISTING", "REVIEW", "OWNER", "STUDENT"]);

export const reportSchema = z
  .object({
    targetType: targetTypeSchema,
    targetId: z.string().trim().min(1).max(191),
    reason: z.enum([
      "FAKE_LISTING",
      "SCAM",
      "WRONG_INFO",
      "OFFENSIVE",
      "DUPLICATE",
      "SPAM",
      "FALSE_INFO",
      "HARASSMENT",
      "FAKE_PROFILE",
      "ABUSIVE_BEHAVIOR",
      "OTHER",
    ]),
    message: z.string().trim().max(500).optional(),
  })
  .strict()
  // The reason must belong to the allowlist for its target type — a tampered client
  // could otherwise pair e.g. "STUDENT" with "FAKE_LISTING".
  .refine((val) => REPORT_REASONS_BY_TARGET[val.targetType as ReportTargetType].includes(val.reason), {
    message: "That reason doesn't apply to this report type.",
    path: ["reason"],
  });

export type ReportInput = z.infer<typeof reportSchema>;

export const resolveReportSchema = z
  .object({
    status: z.enum(["RESOLVED", "DISMISSED"]),
    resolution: z.string().trim().max(500).optional(),
  })
  .strict();
