import { redirect } from "next/navigation";

import { auth } from "@repo/auth";

const ROLE_HOME: Record<string, string> = {
  STUDENT: "/student/dashboard",
  FACULTY: "/faculty/dashboard",
  ADMIN: "/admin/dashboard",
};

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  redirect(ROLE_HOME[session.user.role] ?? "/sign-in");
}
