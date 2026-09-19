import { prisma } from "@/lib/prisma";
import { hashPassword, setSession } from "@/lib/auth";
import { jsonError, readJson, requiredString } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const email = requiredString(body.email, "email").toLowerCase();
    const password = requiredString(body.password, "password");
    if (password.length < 8)
      return jsonError("Password must be at least 8 characters.", 400, "INVALID_PASSWORD");

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return jsonError("An account with this email already exists.", 409, "EMAIL_EXISTS");

    const user = await prisma.user.create({
      data: { email, password: await hashPassword(password) },
      select: { id: true, email: true },
    });
    await setSession(user.id);
    return Response.json({ user });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to register.",
      400,
      "INVALID_REQUEST",
    );
  }
}
