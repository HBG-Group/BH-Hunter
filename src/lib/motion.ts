// Shared animation timings so every interaction across the app feels consistent.

export const DURATION = {
  fast: 0.12,
  base: 0.2,
  slow: 0.3,
} as const;

// Gentle ease-out curve used for entrances and transitions.
export const EASE = [0.22, 1, 0.36, 1] as const;
