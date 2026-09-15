import { prisma } from "@repo/db";

import { getCourseForMember } from "@/lib/api/course-access";
import { requireSession } from "@/lib/api/guards";
import { badRequest, forbidden, notFound, ok, unauthorized } from "@/lib/api/responses";
import { createAnnouncementSchema } from "@/lib/api/validation";

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

  const announcements = await prisma.announcement.findMany({
    where: { courseId },
    orderBy: { createdAt: "desc" },
  });

  return ok(announcements);
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

  const parsed = createAnnouncementSchema.safeParse(await request.json());
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }

  const announcement = await prisma.announcement.create({
    data: { ...parsed.data, courseId, authorId: session.user.id },
  });

  return ok(announcement, 201);
}
