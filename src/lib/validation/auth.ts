import { z } from "zod";

// Server-side shape for the auth forms. The browser's `required`/`type=email` are UX
// only; these run on every submission regardless of what the client sent.

export const MIN_PASSWORD_LENGTH = 8;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email")
  .max(254, "That email is too long")
  .email("Enter a valid email address");

const password = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  .max(72, "Password must be 72 characters or fewer");

export const credentialsSchema = z.object({
  email,
  // Sign-in must not reveal the password policy, so length isn't enforced here.
  password: z.string().min(1, "Enter your password").max(72),
}).strict();

export const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(80, "That name is too long"),
  email,
  password,
  role: z.enum(["OWNER", "STUDENT"]).default("STUDENT"),
  // A checked box submits "on"; anything else means they didn't agree. Enforced on the
  // server so account creation is blocked even if the client control is bypassed.
  terms: z.literal("on", {
    message: "Please accept the Terms & Conditions to continue",
  }),
}).strict();
