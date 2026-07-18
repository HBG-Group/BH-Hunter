"use client";

import { useState } from "react";

interface Props {
  name?: string;
  placeholder?: string;
  minLength?: number;
}

// Password input with a show/hide toggle so users can check for mistyped characters.
export function PasswordField({ name = "password", placeholder = "Password", minLength = 6 }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        name={name}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        required
        minLength={minLength}
        className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 pr-16 text-sm outline-none focus:border-neutral-400"
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-neutral-500 hover:text-neutral-800"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
