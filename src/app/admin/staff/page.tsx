import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/guards";
import { STAFF_DIRECTORY_ROLES } from "@/lib/auth";
import { updateStaff } from "@/app/admin/actions";
import { EmptyState } from "@/components/motion/EmptyStates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Staff" };

export default async function AdminStaffPage() {
  const session = await requireStaff();
  const canEdit = STAFF_DIRECTORY_ROLES.includes(session.role);

  const staff = await prisma.staffProfile.findMany({
    include: {
      user: { select: { name: true, email: true, role: true, active: true } },
      classTeacherOf: { select: { name: true } },
      _count: { select: { assignments: true } },
    },
    orderBy: { staffNo: "asc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Staff</h1>
        <p className="mt-1 text-ivory-100/60">
          {staff.length} staff profile{staff.length === 1 ? "" : "s"}. Update the
          public directory details here; roles and logins live under Users.
        </p>
      </header>

      {!canEdit && (
        <p className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-4 text-sm text-ivory-100/60">
          Only the owner, administrators, principal and vice principals can edit
          staff details. You can still read the directory.
        </p>
      )}

      <div className="space-y-3">
        {staff.map((s) => (
          <details key={s.id} className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5">
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {s.title ? `${s.title} ` : ""}
                  {s.user.name}
                  {!s.user.active && (
                    <span className="ml-2 rounded-full bg-ember-500/20 px-2 py-0.5 text-[10px] text-ember-500">
                      LOGIN DISABLED
                    </span>
                  )}
                </p>
                <p className="text-sm text-ivory-100/60">
                  {s.roleTitle ?? s.user.role.replace(/_/g, " ")} · {s.staffNo}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {s.classTeacherOf && (
                  <span className="rounded-full bg-gold-500/10 px-3 py-1 text-gold-300">
                    Class teacher · {s.classTeacherOf.name}
                  </span>
                )}
                <span className="rounded-full bg-ivory-100/10 px-3 py-1 text-ivory-100/70">
                  {s._count.assignments} subject{s._count.assignments === 1 ? "" : "s"}
                </span>
              </div>
            </summary>

            <p className="mt-3 text-sm text-ivory-100/50">{s.user.email}</p>

            {canEdit && (
              <form action={updateStaff} className="mt-4 grid gap-3 md:grid-cols-2">
                <input type="hidden" name="id" value={s.id} />
                <label className="text-sm text-ivory-100/70">
                  Full name
                  <input
                    name="name"
                    defaultValue={s.user.name}
                    required
                    className="mt-1 block w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm text-ivory-100/70">
                  Title
                  <input
                    name="title"
                    defaultValue={s.title ?? ""}
                    placeholder="Mrs."
                    className="mt-1 block w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm text-ivory-100/70">
                  Role title
                  <input
                    name="roleTitle"
                    defaultValue={s.roleTitle ?? ""}
                    placeholder="Head of Science"
                    className="mt-1 block w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm text-ivory-100/70">
                  Phone (internal only)
                  <input
                    name="phone"
                    defaultValue={s.phone ?? ""}
                    placeholder="+234 …"
                    className="mt-1 block w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm text-ivory-100/70 md:col-span-2">
                  Short bio (shown publicly)
                  <textarea
                    name="bio"
                    rows={3}
                    defaultValue={s.bio ?? ""}
                    placeholder="One or two sentences for the staff directory."
                    className="mt-1 block w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
                  />
                  <span className="mt-1 block text-xs text-ivory-100/40">
                    Appears on /about/leadership. Keep it to role and teaching background —
                    phone numbers and personal details are not published.
                  </span>
                </label>
                <button className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-950 md:col-span-2 md:justify-self-start">
                  Save details
                </button>
              </form>
            )}
          </details>
        ))}
        {staff.length === 0 && (
          <EmptyState
            kind="book"
            tone="dark"
            className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 py-8"
            caption="No staff profiles yet — create a staff account under Users."
          />
        )}
      </div>
    </div>
  );
}
