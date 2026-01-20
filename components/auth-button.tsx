import { createClient } from "@/lib/supabase/server";
import { AuthButtonClient } from "./auth-button-client";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return <AuthButtonClient userEmail={user?.email ?? null} />;
}
