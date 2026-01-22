"use client";

import { Button, Card, Form, Input, Space, Tag, Typography } from "antd";
import { useEffect } from "react";
import { updateProfileMe } from "@/api/endpoints";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/components/session-provider";

export default function SettingsPage() {
  const { token, profile, refreshProfile } = useSession();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!profile) return;
    form.setFieldsValue({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
    });
  }, [profile, form]);

  const handleSubmit = async () => {
    if (!token) return;
    try {
      const values = await form.validateFields();
      await updateProfileMe(token, {
        full_name: values.full_name || undefined,
        phone: values.phone || undefined,
      });
      refreshProfile();
    } catch {
      return;
    }
  };

  return (
    <div className="page-body">
      <PageHeader
        title="Settings"
        subtitle="Keep your profile current and contactable."
      />

      <Card className="section-card">
        <Space direction="vertical" size="large" className="form-stack">
          <div>
            <Typography.Title level={4} style={{ marginBottom: 8 }}>
              Profile
            </Typography.Title>
            <Typography.Text type="secondary">
              User ID: {profile?.id ?? "—"}
            </Typography.Text>
            <div style={{ marginTop: 8 }}>
              <Tag>{profile?.role ?? "member"}</Tag>
            </div>
          </div>
          <Form form={form} layout="vertical">
            <Form.Item label="Full name" name="full_name">
              <Input placeholder="Ava Cortes" />
            </Form.Item>
            <Form.Item label="Phone" name="phone">
              <Input placeholder="+1 (555) 123-4567" />
            </Form.Item>
            <Button type="primary" onClick={handleSubmit}>
              Save changes
            </Button>
          </Form>
        </Space>
      </Card>
    </div>
  );
}
