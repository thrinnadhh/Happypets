import { HttpError } from "./cors.ts";

type AuthenticatedUser = {
  id: string;
  role: string;
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getAuthenticatedUserFromRequest(request: Request): AuthenticatedUser {
  const authorization = request.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) {
    throw new HttpError(401, "Unauthorized");
  }

  const token = authorization.slice(7).trim();
  const payload = decodeJwtPayload(token);
  const userId = typeof payload?.sub === "string" ? payload.sub.trim() : "";
  const role = typeof payload?.role === "string" ? payload.role.trim() : "";

  if (!userId || !role) {
    throw new HttpError(401, "Unauthorized");
  }

  return {
    id: userId,
    role,
  };
}
