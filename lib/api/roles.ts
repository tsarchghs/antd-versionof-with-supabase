import type { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "./errors";
import { ROLE_RANK, type Role } from "./enums";
import { throwIfPostgrestError } from "./supabase-helpers";

export async function requireRole(
  supabase: SupabaseClient,
  userId: string,
  requiredRoles: Role[],
) {
  if (requiredRoles.length === 0) {
    return;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  throwIfPostgrestError(error);

  const role = data?.role as Role | undefined;
  if (!role) {
    throw new HttpError(403, "Role not found");
  }

  const hasAccess = requiredRoles.some(
    (required) => ROLE_RANK[role] >= ROLE_RANK[required],
  );
  if (!hasAccess) {
    throw new HttpError(403, "Insufficient role");
  }
}
