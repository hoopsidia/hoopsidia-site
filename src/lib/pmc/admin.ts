// The single address allowed into the back-office. Overridable via env; the
// value is not secret (it only names who may request a magic link — actual
// access still requires proving control of that inbox).
export const ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_PMC_ADMIN_EMAIL ?? "hoopsidia@gmail.com"
).toLowerCase();
