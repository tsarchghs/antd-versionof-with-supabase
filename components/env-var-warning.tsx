"use client";

import { Button, Space, Tag } from "antd";

export function EnvVarWarning() {
  return (
    <Space size="middle" align="center">
      <Tag color="warning">Supabase environment variables required</Tag>
      <Space size="small">
        <Button size="small" disabled>
          Sign in
        </Button>
        <Button size="small" type="primary" disabled>
          Sign up
        </Button>
      </Space>
    </Space>
  );
}
