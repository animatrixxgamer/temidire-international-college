import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/guards";
import { createStaffUser, toggleUserActive, changeUserRole, resetUserPassword } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const ROLES = ["ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "BURSAR", "CLASS_TEACHER", "TEACHER", "STUDENT", "PARENT"];

export default async function AdminUsersPage() {
  await requireSuperAdmin();
  const users = await prisma.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Users & roles</h1>
        <p className="mt-1 text-ivory-100/60">
          Your special super-admin powers: create accounts, change roles, disable access, reset passwords. Every action is audit-logged.
        </p>
      </header>

      <form action={createStaffUser} className="grid gap-3 rounded-2xl border border-gold-500/25 bg-navy-800/60 p-6 md:grid-cols-5">
        <input name="name" required placeholder="Full name" className="rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5" />
        <input name="email" type="email" required placeholder="email@temidirecollege.ng" className="rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5 md:col-span-1" />
        <select name="role" className="rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5">
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
        <input name="password" type="password" required minLength={8} placeholder="Temp password (8+)" className="rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5" />
        <button className="rounded-full bg-gold-500 px-5 py-2.5 font-semibold text-navy-950">Create account</button>
      </form>

      <div className="space-y-3">
        {users.map((u) => (
          <details key={u.id} className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5">
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {u.name}
                  {u.role === "SUPER_ADMIN" && <span className="ml-2 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold text-navy-950">SUPER ADMIN</span>}
                  {!u.active && <span className="ml-2 rounded-full bg-ember-500/20 px-2 py-0.5 text-[10px] text-ember-500">DISABLED</span>}
                </p>
                <p className="text-sm text-ivory-100/60">{u.email}</p>
              </div>
              <span className="rounded-full bg-ivory-100/10 px-3 py-1 text-xs">{u.role.replace(/_/g, " ")}</span>
            </summary>
            {u.role !== "SUPER_ADMIN" && (
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <form action={changeUserRole} className="flex gap-2">
                  <input type="hidden" name="id" value={u.id} />
                  <select name="role" defaultValue={u.role} className="w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm">
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                  <button className="rounded-md bg-gold-500 px-3 py-2 text-sm font-semibold text-navy-950">Set role</button>
                </form>
                <form action={toggleUserActive}>
                  <input type="hidden" name="id" value={u.id} />
                  <button className={`w-full rounded-md border px-3 py-2 text-sm ${u.active ? "border-ember-500/50 text-ember-500" : "border-emerald-600/50 text-emerald-600"}`}>
                    {u.active ? "Disable account" : "Enable account"}
                  </button>
                </form>
                <form action={resetUserPassword} className="flex gap-2">
                  <input type="hidden" name="id" value={u.id} />
                  <input name="password" type="password" minLength={8} required placeholder="New password" className="w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm" />
                  <button className="rounded-md border border-ivory-100/20 px-3 py-2 text-sm">Reset</button>
                </form>
              </div>
            )}
          </details>
        ))}
      </div>
    </div>
  );
}
