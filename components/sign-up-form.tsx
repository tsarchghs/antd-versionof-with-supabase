"use client";

import { createClient } from "@/lib/supabase/client";
import { Alert, Button, Card, Input, Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
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
              Sign up
            </Typography.Title>
            <Typography.Text type="secondary">
              Create a new account
            </Typography.Text>
          </div>
          <form onSubmit={handleSignUp} className="form-stack">
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
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <Input.Password
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="repeat-password">
                Repeat password
              </label>
              <Input.Password
                id="repeat-password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
            </div>
            {error ? <Alert type="error" showIcon message={error} /> : null}
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
            >
              Sign up
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
    </div>
  );
}
