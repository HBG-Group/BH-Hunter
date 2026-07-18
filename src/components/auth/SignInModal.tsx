"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GoogleButton } from "@/components/auth/GoogleButton";

interface Props {
  next: string | null;
  onClose: () => void;
}

// The gentle sign-in prompt shown when a guest uses a student-only feature.
export function SignInModal({ next, onClose }: Props) {
  const router = useRouter();
  const isOpen = next !== null;
  const returnTo = next ?? "/";

  const goToEmail = () => {
    onClose();
    router.push(`/login?next=${encodeURIComponent(returnTo)}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold text-neutral-900">Sign in to unlock extra features</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Save favorites, leave reviews, and get room alerts. Browsing stays free.
            </p>

            <div className="mt-5 space-y-2.5">
              <GoogleButton next={returnTo} />
              <button
                onClick={goToEmail}
                className="w-full rounded-xl bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Continue with VSU Email
              </button>
              <button
                onClick={onClose}
                className="w-full rounded-xl py-2.5 text-sm font-medium text-neutral-500 hover:text-neutral-800"
              >
                Continue as guest
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
