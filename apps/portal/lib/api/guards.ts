import type { Role } from "@repo/db";
import { auth } from "@repo/auth";
import type { Session } from "next-auth";

export async function requireSession(): Promise<
  | { session: Session; error: null }
  | { session: null; error: "unauthorized" }
> {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: "unauthorized" };
  }
  return { session, error: null };
}

export async function requireRole(
  allowedRoles: readonly Role[],
): Promise<
  | { session: Session; error: null }
  | { session: null; error: "unauthorized" | "forbidden" }
> {
  const { session, error } = await requireSession();
  if (error) {
    return { session: null, error };
  }
  if (!allowedRoles.includes(session.user.role)) {
    return { session: null, error: "forbidden" };
  }
  return { session, error: null };
}
