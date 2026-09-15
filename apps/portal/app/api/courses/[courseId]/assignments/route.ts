import { prisma } from "@repo/db";

import { getCourseForMember } from "@/lib/api/course-access";
import { requireSession } from "@/lib/api/guards";
import { badRequest, forbidden, notFound, ok, unauthorized } from "@/lib/api/responses";
import { createAssignmentSchema } from "@/lib/api/validation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { session, error } = await requireSession();
  if (error) {
    return unauthorized();
  }

  const { courseId } = await params;
  const { course, allowed } = await getCourseForMember(courseId, session.user);
  if (!course) {
    return notFound();
  }
  if (!allowed) {
    return forbidden();
  }

  const assignments = await prisma.assignment.findMany({
    where: { courseId },
    orderBy: { dueAt: "asc" },
  });

  return ok(assignments);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { session, error } = await requireSession();
  if (error) {
    return unauthorized();
  }

  const { courseId } = await params;
  const { course, isInstructor } = await getCourseForMember(
    courseId,
    session.user,
  );
  if (!course) {
    return notFound();
  }
  if (!isInstructor) {
    return forbidden();
  }

  const parsed = createAssignmentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }

  const assignment = await prisma.assignment.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : undefined,
      maxPoints: parsed.data.maxPoints,
      courseId,
    },
  });

  return ok(assignment, 201);
}
