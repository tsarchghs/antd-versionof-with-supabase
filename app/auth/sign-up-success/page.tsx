"use client";

import { Card, Typography } from "antd";

export default function Page() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <Card>
          <div className="form-stack">
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                Thank you for signing up!
              </Typography.Title>
              <Typography.Text type="secondary">
                Check your email to confirm
              </Typography.Text>
            </div>
            <Typography.Paragraph className="text-muted">
              You&apos;ve successfully signed up. Please check your email to
              confirm your account before signing in.
            </Typography.Paragraph>
          </div>
        </Card>
      </div>
    </div>
  );
}
