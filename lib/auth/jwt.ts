import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function createToken(payload: {
  userId: number;
  role: string;
}) {
  return new SignJWT({
    sub: String(payload.userId),
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || "7d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);

  if (!payload.sub || typeof payload.role !== "string") {
    throw new Error("Invalid token");
  }

  return {
    userId: Number(payload.sub),
    role: payload.role,
  };
}
