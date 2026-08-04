"use server";

import { requireOwner } from "@/lib/auth/profile";
import { prisma } from "@/lib/db/prisma";

// Marks the onboarding tutorial as completed for the signed-in owner. Called when they
// finish OR skip — either way it never auto-launches again. Replaying does NOT call this,
// so replays never touch the flag. Idempotent.
export async function completeOwnerTutorialAction(): Promise<{ ok: boolean }> {
  const owner = await requireOwner();
  if (owner.ownerTutorialCompleted) return { ok: true };

  await prisma.profile.update({
    where: { id: owner.id },
    data: { ownerTutorialCompleted: true },
  });
  return { ok: true };
}
