"use client";

import { Alert, Button, Card, Input, Typography } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [linkTokens, setLinkTokens] = useState<{
    accessToken?: string;
    refreshToken?: string;
  } | null>(null);

  const nextPath = useMemo(() => {
    const next = searchParams.get("next");
    if (next && next.startsWith("/")) {
      return next;
    }
    return "/auth/update-password";
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const hash = window.location.hash;
    if (!hash) {
      return;
    }
    const params = new URLSearchParams(hash.slice(1));
    const accessToken = params.get("access_token") ?? undefined;
    const refreshToken = params.get("refresh_token") ?? undefined;
    if (accessToken || refreshToken) {
      setLinkTokens({ accessToken, refreshToken });
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }, []);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const codeParam = searchParams.get("code") ?? searchParams.get("token");
    if (!email && emailParam) {
      setEmail(emailParam);
    }
    if (!code && codeParam) {
      setCode(codeParam);
    }
  }, [code, email, searchParams]);

  const formatErrorMessage = (message: string) => {
    if (/expired|invalid/i.test(message)) {
      return "Invite code is invalid or has expired. Ask an admin to send a new invite.";
    }
    return message;
  };

  const handleLinkContinue = async () => {
    if (!linkTokens?.accessToken || !linkTokens?.refreshToken) {
      setError("Invite link is missing required tokens. Ask for a new invite.");
      return;
    }
    const supabase = createClient();
    setIsVerifying(true);
    setError(null);
    const { error } = await supabase.auth.setSession({
      access_token: linkTokens.accessToken,
      refresh_token: linkTokens.refreshToken,
    });
    if (error) {
      setError(formatErrorMessage(error.message));
    } else {
      router.replace(nextPath);
    }
    setIsVerifying(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = createClient();
    setIsVerifying(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "invite",
    });
    if (error) {
      setError(formatErrorMessage(error.message));
      setIsVerifying(false);
      return;
    }
    router.replace(nextPath);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Card>
          <div className="form-stack">
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                Accept your invite
              </Typography.Title>
              <Typography.Text type="secondary">
                Enter the email and invite code from your email to join the
                company.
              </Typography.Text>
            </div>
            {linkTokens ? (
              <div className="form-stack">
                <Alert
                  type="info"
                  showIcon
                  message="Invite link detected. Continue to set your password, or request a new invite to use the code flow."
                />
                {error ? <Alert type="error" showIcon message={error} /> : null}
                <Button
                  onClick={handleLinkContinue}
                  disabled={isVerifying}
                  loading={isVerifying}
                  block
                >
                  Continue to set password
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="form-stack">
                <div className="form-field">
                  <label className="form-label" htmlFor="invite-email">
                    Email
                  </label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="you@company.com"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isVerifying}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="invite-code">
                    Invite code
                  </label>
                  <Input
                    id="invite-code"
                    placeholder="Enter the code from your email"
                    required
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    disabled={isVerifying}
                  />
                </div>
                {error ? <Alert type="error" showIcon message={error} /> : null}
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isVerifying}
                  block
                >
                  Accept invite
                </Button>
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
