import { z } from "zod";

export const createCourseSchema = z.object({
  code: z.string().min(1).max(32),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
});

export const enrollSchema = z.object({
  userId: z.cuid(),
});

export const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
});

export const createAssignmentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(10000).optional(),
  dueAt: z.iso.datetime().optional(),
  maxPoints: z.number().int().positive().max(1000).optional(),
});

export const createSubmissionSchema = z.object({
  content: z.string().min(1).max(20000),
});

export const gradeSubmissionSchema = z.object({
  grade: z.number().min(0),
  feedback: z.string().max(10000).optional(),
});
