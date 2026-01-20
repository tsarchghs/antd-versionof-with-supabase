"use client";

import { createClient } from "@/lib/supabase/client";
import { Alert, Button, Card, Input, Typography } from "antd";
import Link from "next/link";
import { useMemo, useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const containerClassName = useMemo(
    () => ["form-stack", className].filter(Boolean).join(" "),
    [className],
  );

  return (
    <div className={containerClassName} {...props}>
      {success ? (
        <Card>
          <div className="form-stack">
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                Check your email
              </Typography.Title>
              <Typography.Text type="secondary">
                Password reset instructions sent
              </Typography.Text>
            </div>
            <Typography.Paragraph className="text-muted">
              If you registered using your email and password, you will receive
              a password reset email.
            </Typography.Paragraph>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="form-stack">
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                Reset your password
              </Typography.Title>
              <Typography.Text type="secondary">
                Type in your email and we&apos;ll send you a link to reset your
                password
              </Typography.Text>
            </div>
            <form onSubmit={handleForgotPassword} className="form-stack">
              <div className="form-field">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error ? <Alert type="error" showIcon message={error} /> : null}
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
              >
                Send reset email
              </Button>
            </form>
            <div className="form-footer">
              Already have an account?{" "}
              <Link href="/auth/login" className="link-strong">
                Login
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
