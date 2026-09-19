import { currentUserId } from "@/lib/auth";
import { isValidTimezone } from "@/lib/dates";
import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return jsonError("You must be logged in.", 401, "UNAUTHENTICATED");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, timezone: true },
  });
  return user ? Response.json({ user }) : jsonError("User not found.", 404, "USER_NOT_FOUND");
}

export async function PATCH(request: Request) {
  const userId = await currentUserId();
  if (!userId) return jsonError("You must be logged in.", 401, "UNAUTHENTICATED");
  const body = await readJson(request);
  if (typeof body.timezone !== "string" || !isValidTimezone(body.timezone)) {
    return jsonError("Please provide a valid IANA timezone.", 400, "INVALID_TIMEZONE");
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: { timezone: body.timezone },
    select: { id: true, email: true, timezone: true },
  });
  return Response.json({ user });
}
