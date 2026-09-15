import { prisma, Role } from "@repo/db";

import { getCourseForMember } from "@/lib/api/course-access";
import { requireRole } from "@/lib/api/guards";
import {
  badRequest,
  conflict,
  forbidden,
  notFound,
  ok,
  unauthorized,
} from "@/lib/api/responses";
import { enrollSchema } from "@/lib/api/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const result = await requireRole([Role.FACULTY, Role.ADMIN]);
  if (!result.session) {
    return result.error === "unauthorized" ? unauthorized() : forbidden();
  }

  const { courseId } = await params;
  const { course, isInstructor } = await getCourseForMember(
    courseId,
    result.session.user,
  );

  if (!course) {
    return notFound();
  }
  if (!isInstructor) {
    return forbidden();
  }

  const parsed = enrollSchema.safeParse(await request.json());
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }

  const student = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
  });
  if (!student) {
    return badRequest("User does not exist");
  }

  const existing = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId: parsed.data.userId, courseId },
    },
  });
  if (existing) {
    return conflict("Already enrolled");
  }

  const enrollment = await prisma.enrollment.create({
    data: { userId: parsed.data.userId, courseId },
  });

  return ok(enrollment, 201);
}
