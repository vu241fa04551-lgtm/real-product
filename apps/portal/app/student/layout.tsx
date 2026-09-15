import { NavBar } from "@repo/ui/nav-bar";

import { auth } from "@repo/auth";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <>
      <NavBar
        title="Utopianscore — Student"
        links={[{ href: "/student/dashboard", label: "Dashboard" }]}
        userEmail={session?.user?.email ?? undefined}
      />
      {children}
    </>
  );
}
