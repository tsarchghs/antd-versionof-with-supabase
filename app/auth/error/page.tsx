"use client";

import { Card, Typography } from "antd";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  const message = error
    ? `Code error: ${error}`
    : "An unspecified error occurred.";

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Card>
          <div className="form-stack">
            <Typography.Title level={3} style={{ margin: 0 }}>
              Sorry, something went wrong.
            </Typography.Title>
            <Typography.Text type="secondary">{message}</Typography.Text>
          </div>
        </Card>
      </div>
    </div>
  );
}
