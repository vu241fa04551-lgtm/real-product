import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export const badRequest = (message = "Bad request") => fail(message, 400);
export const unauthorized = (message = "Unauthorized") => fail(message, 401);
export const forbidden = (message = "Forbidden") => fail(message, 403);
export const notFound = (message = "Not found") => fail(message, 404);
export const conflict = (message = "Conflict") => fail(message, 409);
