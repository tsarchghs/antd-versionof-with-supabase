import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { ensureEnv, HttpError } from "./errors";

export type AuthUser = {
  id: string;
  email?: string | null;
};

export type AuthContext = {
  user: AuthUser;
  token: string;
  supabase: SupabaseClient;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function createAnonClient() {
  const url = ensureEnv(SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = ensureEnv(
    SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function createUserClient(token: string) {
  const url = ensureEnv(SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = ensureEnv(
    SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export function getAdminClient(): SupabaseClient {
  const url = ensureEnv(SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = ensureEnv(
    SUPABASE_SERVICE_ROLE_KEY,
    "SUPABASE_SERVICE_ROLE_KEY",
  );
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getUserFromToken(token: string): Promise<User> {
  const anonClient = createAnonClient();
  const { data, error } = await anonClient.auth.getUser(token);
  if (error || !data?.user) {
    throw new HttpError(401, "Invalid token");
  }
  return data.user;
}

function getBearerToken(request: NextRequest): string {
  const header = request.headers.get("authorization");
  if (!header) {
    throw new HttpError(401, "Missing bearer token");
  }
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new HttpError(401, "Missing bearer token");
  }
  return token;
}

export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  const token = getBearerToken(request);
  const user = await getUserFromToken(token);
  return {
    token,
    user: { id: user.id, email: user.email },
    supabase: createUserClient(token),
  };
}
