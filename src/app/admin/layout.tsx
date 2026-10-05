import Link from "next/link";
import { requireStaff } from "@/lib/guards";
import LogoutButton from "@/components/admin/LogoutButton";

const NAV = [
  ["/admin", "Overview"],
  ["/admin/applications", "Applications"],
  ["/admin/news", "News"],
  ["/admin/events", "Events"],
  ["/admin/gallery", "Gallery"],
  ["/admin/inbox", "Inbox"],
  ["/admin/users", "Users"],
  ["/admin/settings", "Settings"],
  ["/admin/audit", "Audit log"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();
  const isSuper = session.role === "SUPER_ADMIN";
  const nav = isSuper ? NAV : NAV.filter(([href]) => href !== "/admin/users" && href !== "/admin/settings");

  return (
    <div className="min-h-screen bg-navy-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="lg:w-60 lg:shrink-0">
          <div className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-4">
            <p className="text-xs uppercase tracking-wider text-ivory-100/40">Signed in</p>
            <p className="mt-1 truncate font-semibold">{session.name}</p>
            <p className="text-xs text-gold-500">{session.role.replace(/_/g, " ")}</p>
            <nav aria-label="Admin" className="mt-5 space-y-1">
              {nav.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="block rounded-lg px-3 py-2 text-sm text-ivory-100/80 transition hover:bg-gold-500/10 hover:text-gold-500"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-5 border-t border-ivory-100/10 pt-4">
              <Link href="/" className="block rounded-lg px-3 py-2 text-sm text-ivory-100/60 hover:text-ivory-100">
                ← View website
              </Link>
              <LogoutButton />
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
