"use server";

import { z } from "zod";
import { requireOwner } from "@/lib/auth/profile";
import { allow, LIMITS, RATE_LIMITED } from "@/lib/security/rate-limit";
import { guarded } from "@/lib/security/errors";
import { isAllowedPhotoMime, MAX_PHOTO_BYTES } from "@/config/storage";
import { uploadReceipt } from "@/lib/storage/receipts";
import { sendPaymentNotice } from "@/lib/email/payment";
import { PLANS } from "@/config/pricing";

type Result = { error?: string; ok?: boolean };

const detailsSchema = z.object({
  planId: z.enum(["basic", "advance", "premium"]),
  name: z.string().trim().min(2, "Enter your name.").max(120),
  phoneLast4: z.string().regex(/^\d{4}$/, "Enter the last 4 digits of your phone number."),
});

// An owner submits proof of a GCash payment. We store the receipt, then email the admin
// so they can approve the subscription manually. No funds move through the app.
export async function submitPaymentAction(formData: FormData): Promise<Result> {
  const owner = await requireOwner();
  if (!(await allow("upload", LIMITS.upload, owner.id))) return { error: RATE_LIMITED };

  const parsed = detailsSchema.safeParse({
    planId: formData.get("planId"),
    name: formData.get("name"),
    phoneLast4: formData.get("phoneLast4"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const plan = PLANS.find((p) => p.id === parsed.data.planId);
  if (!plan) return { error: "Unknown plan." };

  const receipt = formData.get("receipt");
  if (!(receipt instanceof File) || receipt.size === 0) {
    return { error: "Please attach your payment receipt." };
  }
  if (receipt.size > MAX_PHOTO_BYTES) return { error: "Receipt must be under 5 MB." };
  if (!isAllowedPhotoMime(receipt.type)) {
    return { error: "Receipt must be a JPG, PNG, or WebP image." };
  }

  return guarded<Result>(
    "submitPayment",
    async () => {
      const bytes = await receipt.arrayBuffer();
      const receiptUrl = await uploadReceipt(owner.id, bytes, receipt.type);

      await sendPaymentNotice({
        planName: plan.name,
        amount: plan.price,
        ownerName: owner.fullName,
        ownerEmail: owner.email,
        payerName: parsed.data.name,
        phoneLast4: parsed.data.phoneLast4,
        receiptUrl,
      });

      return { ok: true };
    },
    (message) => ({ error: message }),
  );
}
