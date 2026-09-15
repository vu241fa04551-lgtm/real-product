import { NavBar } from "@repo/ui/nav-bar";

import { auth } from "@repo/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <>
      <NavBar
        title="Utopianscore — Admin"
        links={[
          { href: "/admin/dashboard", label: "Dashboard" },
          { href: "/admin/users", label: "Users" },
          { href: "/admin/courses", label: "Courses" },
        ]}
        userEmail={session?.user?.email ?? undefined}
      />
      {children}
    </>
  );
}
