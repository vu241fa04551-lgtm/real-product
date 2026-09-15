import { prisma, Role } from "@repo/db";

import { requireRole, requireSession } from "@/lib/api/guards";
import { badRequest, forbidden, ok, unauthorized } from "@/lib/api/responses";
import { createCourseSchema } from "@/lib/api/validation";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) {
    return unauthorized();
  }

  const courses =
    session.user.role === Role.ADMIN
      ? await prisma.course.findMany({ orderBy: { code: "asc" } })
      : session.user.role === Role.FACULTY
        ? await prisma.course.findMany({
            where: { instructorId: session.user.id },
            orderBy: { code: "asc" },
          })
        : await prisma.course.findMany({
            where: { enrollments: { some: { userId: session.user.id } } },
            orderBy: { code: "asc" },
          });

  return ok(courses);
}

export async function POST(request: Request) {
  const result = await requireRole([Role.FACULTY, Role.ADMIN]);
  if (!result.session) {
    return result.error === "unauthorized" ? unauthorized() : forbidden();
  }

  const parsed = createCourseSchema.safeParse(await request.json());
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }

  const course = await prisma.course.create({
    data: { ...parsed.data, instructorId: result.session.user.id },
  });

  return ok(course, 201);
}
