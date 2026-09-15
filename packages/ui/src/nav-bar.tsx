interface NavLink {
  href: string;
  label: string;
}

interface NavBarProps {
  title: string;
  links: NavLink[];
  userEmail?: string;
}

export function NavBar({ title, links, userEmail }: NavBarProps) {
  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.5rem", borderBottom: "1px solid #e5e5e5" }}>
      <strong>{title}</strong>
      <nav style={{ display: "flex", gap: "1rem" }}>
        {links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      {userEmail ? <span>{userEmail}</span> : null}
    </header>
  );
}
