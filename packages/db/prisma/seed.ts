import bcrypt from "bcryptjs";

import { prisma, Role } from "../src/client";

async function main() {
  const password = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@utopianscore.edu" },
    update: {},
    create: {
      email: "admin@utopianscore.edu",
      name: "Ada Admin",
      role: Role.ADMIN,
      passwordHash: password,
    },
  });

  const faculty = await prisma.user.upsert({
    where: { email: "faculty@utopianscore.edu" },
    update: {},
    create: {
      email: "faculty@utopianscore.edu",
      name: "Frank Faculty",
      role: Role.FACULTY,
      passwordHash: password,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@utopianscore.edu" },
    update: {},
    create: {
      email: "student@utopianscore.edu",
      name: "Sam Student",
      role: Role.STUDENT,
      passwordHash: password,
    },
  });

  const course = await prisma.course.upsert({
    where: { code: "CS101-F26" },
    update: {},
    create: {
      code: "CS101-F26",
      title: "Introduction to Computer Science",
      description: "Foundations of programming and computational thinking.",
      instructorId: faculty.id,
    },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
    update: {},
    create: { userId: student.id, courseId: course.id },
  });

  console.log("Seeded:", { admin: admin.email, faculty: faculty.email, student: student.email, course: course.code });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
