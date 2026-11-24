import "server-only";
import { prisma } from "@/lib/db";

/**
 * Which pupils this session may pay for: the pupil themselves, or every child of
 * a parent who is still on the active roll. Shared by checkout and confirmation.
 */
export async function payableStudentIds(userId: string): Promise<string[]> {
  const own = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true, active: true },
  });
  if (own) return own.active ? [own.id] : [];

  const parent = await prisma.parentProfile.findUnique({
    where: { userId },
    select: {
      children: {
        select: { studentId: true, student: { select: { active: true } } },
      },
    },
  });
  return parent?.children.filter((c) => c.student.active).map((c) => c.studentId) ?? [];
}
