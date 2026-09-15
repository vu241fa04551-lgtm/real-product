import { prisma, Role } from "@repo/db";

import { getCourseForMember } from "@/lib/api/course-access";
import { requireSession } from "@/lib/api/guards";
import {
  badRequest,
  conflict,
  forbidden,
  notFound,
  ok,
  unauthorized,
} from "@/lib/api/responses";
import { createSubmissionSchema } from "@/lib/api/validation";

async function loadAssignmentWithCourseAccess(
  assignmentId: string,
  user: { id: string; role: Role },
) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });
  if (!assignment) {
    return { assignment: null, course: null, allowed: false, isInstructor: false };
  }

  const { course, allowed, isInstructor } = await getCourseForMember(
    assignment.courseId,
    user,
  );

  return { assignment, course, allowed, isInstructor };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ assignmentId: string }> },
) {
  const { session, error } = await requireSession();
  if (error) {
    return unauthorized();
  }

  const { assignmentId } = await params;
  const { assignment, course, allowed, isInstructor } =
    await loadAssignmentWithCourseAccess(assignmentId, session.user);

  if (!assignment || !course) {
    return notFound();
  }
  if (!allowed) {
    return forbidden();
  }

  const submissions = isInstructor
    ? await prisma.submission.findMany({
        where: { assignmentId },
        orderBy: { submittedAt: "desc" },
      })
    : await prisma.submission.findMany({
        where: { assignmentId, studentId: session.user.id },
      });

  return ok(submissions);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ assignmentId: string }> },
) {
  const { session, error } = await requireSession();
  if (error) {
    return unauthorized();
  }
  if (session.user.role !== Role.STUDENT) {
    return forbidden("Only students can submit assignments");
  }

  const { assignmentId } = await params;
  const { assignment, course, allowed } = await loadAssignmentWithCourseAccess(
    assignmentId,
    session.user,
  );

  if (!assignment || !course) {
    return notFound();
  }
  if (!allowed) {
    return forbidden();
  }

  const parsed = createSubmissionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }

  const existing = await prisma.submission.findUnique({
    where: {
      assignmentId_studentId: {
        assignmentId,
        studentId: session.user.id,
      },
    },
  });
  if (existing) {
    return conflict("Assignment already submitted");
  }

  const submission = await prisma.submission.create({
    data: {
      assignmentId,
      studentId: session.user.id,
      content: parsed.data.content,
    },
  });

  return ok(submission, 201);
}
