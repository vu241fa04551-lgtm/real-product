import { NavBar } from "@repo/ui/nav-bar";

import { auth } from "@repo/auth";

export default async function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <>
      <NavBar
        title="Utopianscore — Faculty"
        links={[{ href: "/faculty/dashboard", label: "Dashboard" }]}
        userEmail={session?.user?.email ?? undefined}
      />
      {children}
    </>
  );
}
