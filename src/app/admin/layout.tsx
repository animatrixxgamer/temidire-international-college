import Link from "next/link";
import { requireStaff } from "@/lib/guards";
import LogoutButton from "@/components/admin/LogoutButton";
import AdminBell from "@/components/admin/AdminBell";
import { prisma } from "@/lib/db";
import type { BellNotification } from "@/components/admin/NotificationBell";

const NAV = [
  ["/admin", "Overview"],
  ["/admin/applications", "Applications"],
  ["/admin/attendance", "Attendance"],
  ["/admin/scores", "Scores"],
  ["/admin/news", "News"],
  ["/admin/events", "Events"],
  ["/admin/gallery", "Gallery"],
  ["/admin/inbox", "Inbox"],
  ["/admin/users", "Users"],
  ["/admin/settings", "Settings"],
  ["/admin/audit", "Audit log"],
];

const STAFF_ONLY = ["/admin/users", "/admin/settings"];
/** Preview tools — hidden from roles that never touch registers or marks. */
const TEACHING_ONLY = ["/admin/attendance", "/admin/scores"];

const ago = (d: Date) => {
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
};

async function loadBell() {
  try {
    const [unread, recent] = await Promise.all([
      prisma.contactMessage.count({ where: { handled: false } }),
      prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);
    const items: BellNotification[] = recent.map((m) => ({
      id: m.id,
      title: m.subject,
      detail: m.name,
      time: ago(m.createdAt),
    }));
    return { unread, items };
  } catch {
    return { unread: 0, items: [] as BellNotification[] };
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();
  const isSuper = session.role === "SUPER_ADMIN";
  const canTeach = isSuper || !["BURSAR", "ADMINISTRATOR"].includes(session.role);
  const bell = await loadBell();

  const nav = NAV.filter(([href]) => {
    if (STAFF_ONLY.includes(href) && !isSuper) return false;
    if (TEACHING_ONLY.includes(href) && !canTeach) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-navy-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="lg:w-60 lg:shrink-0">
          <div className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-ivory-100/40">Signed in</p>
                <p className="mt-1 truncate font-semibold">{session.name}</p>
                <p className="text-xs text-gold-500">{session.role.replace(/_/g, " ")}</p>
              </div>
              <AdminBell unread={bell.unread} items={bell.items} />
            </div>
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
