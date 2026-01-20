"use client";

import { createClient } from "@/lib/supabase/client";
import { Alert, Button, Card, Input, Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/protected");
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
      <Card>
        <div className="form-stack">
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Login
            </Typography.Title>
            <Typography.Text type="secondary">
              Enter your email below to login to your account
            </Typography.Text>
          </div>
          <form onSubmit={handleLogin} className="form-stack">
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
            <div className="form-field">
              <div className="form-field-row">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="link-strong">
                  Forgot your password?
                </Link>
              </div>
              <Input.Password
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error ? <Alert type="error" showIcon message={error} /> : null}
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
            >
              Login
            </Button>
          </form>
          <div className="form-footer">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="link-strong">
              Sign up
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
