import { prisma } from "@repo/db";

import { getCourseForMember } from "@/lib/api/course-access";
import { requireSession } from "@/lib/api/guards";
import { badRequest, forbidden, notFound, ok, unauthorized } from "@/lib/api/responses";
import { gradeSubmissionSchema } from "@/lib/api/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> },
) {
  const { session, error } = await requireSession();
  if (error) {
    return unauthorized();
  }

  const { submissionId } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { assignment: true },
  });
  if (!submission) {
    return notFound();
  }

  const { isInstructor } = await getCourseForMember(
    submission.assignment.courseId,
    session.user,
  );
  if (!isInstructor) {
    return forbidden();
  }

  const parsed = gradeSubmissionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }

  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      grade: parsed.data.grade,
      feedback: parsed.data.feedback,
      gradedAt: new Date(),
      gradedById: session.user.id,
    },
  });

  return ok(updated);
}
