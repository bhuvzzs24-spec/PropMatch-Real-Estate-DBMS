import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

export async function requireAuth(request?: NextRequest) {
  const cookieName = process.env.COOKIE_NAME || "propmatch_token";

  let token: string | undefined;

  if (request) {
    token = request.cookies.get(cookieName)?.value;
  }

  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get(cookieName)?.value;
  }

  if (!token) {
    return null;
  }

  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}
