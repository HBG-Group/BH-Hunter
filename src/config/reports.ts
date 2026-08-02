// Shared vocabulary for the reporting feature — which reasons apply to which target
// type, and their display labels. Keeps the UI and validation from drifting apart.

export type ReportTargetType = "LISTING" | "REVIEW" | "OWNER" | "STUDENT";

export type ReportReason =
  | "FAKE_LISTING"
  | "SCAM"
  | "WRONG_INFO"
  | "OFFENSIVE"
  | "DUPLICATE"
  | "SPAM"
  | "FALSE_INFO"
  | "HARASSMENT"
  | "FAKE_PROFILE"
  | "ABUSIVE_BEHAVIOR"
  | "OTHER";

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  FAKE_LISTING: "Fake listing",
  SCAM: "Scam",
  WRONG_INFO: "Wrong information",
  OFFENSIVE: "Offensive content",
  DUPLICATE: "Duplicate listing",
  SPAM: "Spam",
  FALSE_INFO: "False information",
  HARASSMENT: "Harassment",
  FAKE_PROFILE: "Fake profile",
  ABUSIVE_BEHAVIOR: "Abusive behavior",
  OTHER: "Other",
};

export const REPORT_REASONS_BY_TARGET: Record<ReportTargetType, ReportReason[]> = {
  LISTING: ["FAKE_LISTING", "SCAM", "WRONG_INFO", "OFFENSIVE", "DUPLICATE", "OTHER"],
  REVIEW: ["SPAM", "FALSE_INFO", "OFFENSIVE", "HARASSMENT", "OTHER"],
  OWNER: ["SCAM", "HARASSMENT", "ABUSIVE_BEHAVIOR", "FAKE_PROFILE", "OTHER"],
  STUDENT: ["HARASSMENT", "ABUSIVE_BEHAVIOR", "FAKE_PROFILE", "SPAM", "OTHER"],
};

export const REPORT_TARGET_LABELS: Record<ReportTargetType, string> = {
  LISTING: "listing",
  REVIEW: "review",
  OWNER: "owner",
  STUDENT: "student",
};
