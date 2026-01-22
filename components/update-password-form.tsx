"use client";

import { createClient } from "@/lib/supabase/client";
import { Alert, Button, Card, Input, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/dashboard");
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
              Reset your password
            </Typography.Title>
            <Typography.Text type="secondary">
              Please enter your new password below.
            </Typography.Text>
          </div>
          <form onSubmit={handleForgotPassword} className="form-stack">
            <div className="form-field">
              <label className="form-label" htmlFor="password">
                New password
              </label>
              <Input.Password
                id="password"
                placeholder="New password"
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
              Save new password
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
