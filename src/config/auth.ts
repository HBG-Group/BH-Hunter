// Student sign-in settings. Change the accepted email domains here in one place.

// Emails ending in these domains are accepted as VSU students.
export const ALLOWED_STUDENT_EMAIL_DOMAINS = ["vsu.edu.ph", "student.vsu.edu.ph"];

// Where users land after signing in with Google.
export const OAUTH_CALLBACK_PATH = "/auth/callback";

export function isAllowedStudentEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return false;
  return ALLOWED_STUDENT_EMAIL_DOMAINS.includes(domain);
}

// A human-friendly reminder for the sign-up form.
export const STUDENT_EMAIL_HINT = `Use your VSU email (${ALLOWED_STUDENT_EMAIL_DOMAINS.map((d) => "@" + d).join(" or ")}).`;
