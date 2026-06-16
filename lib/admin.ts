import type { Session } from "next-auth";

// Accounts allowed to create badges / Rights of Passage and manage categories.
export const ADMIN_EMAILS = ["quaedrikk@gmail.com"];

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

export function isAdmin(session: Session | null): boolean {
  return isAdminEmail(session?.user?.email);
}
