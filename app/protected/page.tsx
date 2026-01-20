import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { InfoIcon } from "lucide-react";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";
import { Suspense } from "react";

async function UserDetails() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return JSON.stringify(data.claims, null, 2);
}

export default function ProtectedPage() {
  return (
    <div className="content-stack">
      <div className="info-panel">
        <InfoIcon size={16} strokeWidth={2} />
        <span>
          This is a protected page that you can only see as an authenticated
          user
        </span>
      </div>
      <section className="content-stack">
        <h2 className="section-title">Your user details</h2>
        <pre className="user-details">
          <Suspense>
            <UserDetails />
          </Suspense>
        </pre>
      </section>
      <section className="content-stack">
        <h2 className="section-title">Next steps</h2>
        <FetchDataSteps />
      </section>
    </div>
  );
}
