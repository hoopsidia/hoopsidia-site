import type { Metadata } from "next";
import AdminApp from "./AdminApp";

// Back-office — mobile-first moderation. Protected client-side by magic-link
// auth (restricted to the admin email); every admin API route re-verifies the
// caller server-side. Never indexed.
export const metadata: Metadata = {
  title: "Back-office",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminApp />;
}
