import { redirect } from "next/navigation";

import { auth } from "@repo/auth";

const ALLOWED_ROLES = ["STUDENT", "FACULTY", "ADMIN"];

export default async function StudentDashboard() {
  const session = await auth();

  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    redirect("/sign-in");
  }

  return (
    <main>
      <h1>Student dashboard</h1>
      <p>
        Signed in as {session.user.email} ({session.user.role})
      </p>
    </main>
  );
}
