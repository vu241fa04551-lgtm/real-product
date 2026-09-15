import { prisma, Role } from "@repo/db";

type SessionUser = { id: string; role: Role };

export async function getCourseForMember(courseId: string, user: SessionUser) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { enrollments: true },
  });

  if (!course) {
    return { course: null, allowed: false, isInstructor: false };
  }

  const isInstructor = course.instructorId === user.id;
  const isEnrolled = course.enrollments.some(
    (enrollment) => enrollment.userId === user.id,
  );
  const isAdmin = user.role === Role.ADMIN;

  return {
    course,
    allowed: isInstructor || isEnrolled || isAdmin,
    isInstructor: isInstructor || isAdmin,
  };
}
