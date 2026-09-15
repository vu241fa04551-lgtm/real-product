import { redirect } from "next/navigation";

import { auth } from "@repo/auth";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  return (
    <main>
      <h1>Admin dashboard</h1>
      <p>
        Signed in as {session.user.email} ({session.user.role})
      </p>
    </main>
  );
}
