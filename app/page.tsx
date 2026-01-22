import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return (
    <main className="landing-shell">
      <nav className="landing-nav">
        <Link href="/" className="landing-brand">
          ForgeTrack
        </Link>
        <div className="landing-actions">
          {user ? (
            <Link href="/dashboard" className="app-primary-link">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="app-link">
                Sign in
              </Link>
              <Link href="/auth/sign-up" className="app-primary-link">
                Create account
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="landing-hero">
        <div>
          <p className="text-muted">Construction progress intelligence</p>
          <h1 className="landing-hero-title">
            Progress clarity for every crew and site.
          </h1>
          <p className="landing-hero-subtitle">
            ForgeTrack pulls project, task, and work log data into a single
            command center. Approve labor faster, spot bottlenecks earlier, and
            keep leadership aligned with live metrics.
          </p>
          <div className="landing-actions landing-hero-actions">
            <Link href="/dashboard" className="app-primary-link">
              View live dashboard
            </Link>
            <Link href="/auth/login" className="app-link">
              Sign in
            </Link>
          </div>
        </div>

        <div className="landing-hero-card">
          <div>
            <p className="text-muted">Live snapshot</p>
            <h3>Week 14 delivery pulse</h3>
          </div>
          <ul className="landing-stats">
            <li>
              <span className="landing-stat-value">128</span>
              <span className="landing-stat-label">Hours approved</span>
            </li>
            <li>
              <span className="landing-stat-value">24</span>
              <span className="landing-stat-label">Tasks active</span>
            </li>
            <li>
              <span className="landing-stat-value">6</span>
              <span className="landing-stat-label">Logs pending</span>
            </li>
          </ul>
          <Link href="/reports" className="app-link">
            Explore reporting
          </Link>
        </div>
      </section>

      <section className="landing-grid">
        <div className="landing-card">
          <h3>Unified project control</h3>
          <p className="text-muted">
            Connect schedule, task scope, and crew assignment with a clear view
            of status, dates, and workloads.
          </p>
        </div>
        <div className="landing-card">
          <h3>Frictionless approvals</h3>
          <p className="text-muted">
            Managers can approve or reject work logs instantly, with notes
            preserved for audit trails.
          </p>
        </div>
        <div className="landing-card">
          <h3>Attachment-ready reporting</h3>
          <p className="text-muted">
            Upload photos and documents alongside tasks to document progress and
            de-risk handoffs.
          </p>
        </div>
      </section>

      <footer className="landing-footer">
        <span>ForgeTrack &copy; 2026</span>
        <span>Built for fast-moving construction teams.</span>
      </footer>
    </main>
  );
}
