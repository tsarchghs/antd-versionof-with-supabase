"use client";

import { Button, Space, Typography } from "antd";
import { LogoutButton } from "./logout-button";

export function AuthButtonClient({
  userEmail,
}: {
  userEmail?: string | null;
}) {
  return userEmail ? (
    <Space size="middle" align="center">
      <Typography.Text>Hey, {userEmail}!</Typography.Text>
      <LogoutButton />
    </Space>
  ) : (
    <Space size="small">
      <Button size="small" href="/auth/login">
        Sign in
      </Button>
      <Button size="small" type="primary" href="/auth/sign-up">
        Sign up
      </Button>
    </Space>
  );
}
