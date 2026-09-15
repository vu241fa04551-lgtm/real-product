import { redirect } from "next/navigation";

import { auth } from "@repo/auth";

const ALLOWED_ROLES = ["FACULTY", "ADMIN"];

export default async function FacultyDashboard() {
  const session = await auth();

  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    redirect("/sign-in");
  }

  return (
    <main>
      <h1>Faculty dashboard</h1>
      <p>
        Signed in as {session.user.email} ({session.user.role})
      </p>
    </main>
  );
}
