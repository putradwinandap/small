import { prisma } from "@/lib/prisma";
import { setSession, verifyPassword } from "@/lib/auth";
import { jsonError, readJson, requiredString } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const email = requiredString(body.email, "email").toLowerCase();
    const password = requiredString(body.password, "password");
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(password, user.password))) {
      return jsonError("Email or password is incorrect.", 401, "INVALID_CREDENTIALS");
    }

    await setSession(user.id);
    return Response.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to login.",
      400,
      "INVALID_REQUEST",
    );
  }
}
