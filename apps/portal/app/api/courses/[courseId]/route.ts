import { requireSession } from "@/lib/api/guards";
import { getCourseForMember } from "@/lib/api/course-access";
import { forbidden, notFound, ok, unauthorized } from "@/lib/api/responses";

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

  return ok(course);
}
