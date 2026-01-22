"use client";

import { Space, Typography } from "antd";

export function PageHeader({
  title,
  subtitle,
  extra,
}: {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <Space direction="vertical" size={4}>
        <Typography.Title level={2} className="page-title">
          {title}
        </Typography.Title>
        {subtitle ? (
          <Typography.Text type="secondary">{subtitle}</Typography.Text>
        ) : null}
      </Space>
      {extra ? <div className="page-header-actions">{extra}</div> : null}
    </div>
  );
}
