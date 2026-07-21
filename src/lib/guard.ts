import { headers } from "next/headers";
import { auth } from "./auth";

/** Server-side gate for admin pages, actions, and API routes. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}
