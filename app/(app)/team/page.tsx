"use client";

import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import {
  createCompany,
  getProfilesCompany,
  inviteUser,
  updateCompany,
} from "@/api/endpoints";
import type { Profile } from "@/api/types";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/components/session-provider";

export default function TeamPage() {
  const { token, company, profile, refreshProfile, setCompany } = useSession();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyForm] = Form.useForm();
  const [inviteForm] = Form.useForm();
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const loadProfiles = useCallback(() => {
    if (!token || profile?.role === "member") return;
    setLoading(true);
    getProfilesCompany(token)
      .then(setProfiles)
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  }, [profile?.role, token]);

  useEffect(() => loadProfiles(), [loadProfiles]);

  useEffect(() => {
    if (company) {
      companyForm.setFieldsValue({ name: company.name });
    }
  }, [company, companyForm]);

  const handleCompanySubmit = async () => {
    if (!token) return;
    setCompanyError(null);
    try {
      const values = await companyForm.validateFields();
      const nextCompany = company
        ? await updateCompany(token, company.id, values.name)
        : await createCompany(token, values.name);
      await refreshProfile();
      setCompany(nextCompany);
      companyForm.setFieldsValue({ name: nextCompany.name });
      loadProfiles();
    } catch (error) {
      setCompanyError(
        error instanceof Error ? error.message : "Company update failed.",
      );
    }
  };

  const handleInvite = async () => {
    if (!token) return;
    setInviteError(null);
    try {
      const values = await inviteForm.validateFields();
      await inviteUser(token, values.email);
      inviteForm.resetFields();
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : "Invite failed.");
    }
  };

  if (profile?.role === "member") {
    return (
      <div className="page-body">
        <PageHeader
          title="Team"
          subtitle="Managers and admins can view company rosters."
        />
        <Card className="section-card">
          <Typography.Text type="secondary">
            You do not have access to the team roster.
          </Typography.Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-body">
      <PageHeader
        title="Team"
        subtitle="Manage your company, roster, and invitations."
      />

      <Card className="section-card">
        <Space direction="vertical" size="large" className="form-stack">
          <div>
            <Typography.Title level={4} style={{ marginBottom: 8 }}>
              Company profile
            </Typography.Title>
            {profile?.role === "admin" ? (
              <Form form={companyForm} layout="vertical">
                <Form.Item
                  label="Company name"
                  name="name"
                  rules={[{ required: true, message: "Enter a company name." }]}
                >
                  <Input placeholder="Atlas Build Group" />
                </Form.Item>
                <Button type="primary" onClick={handleCompanySubmit}>
                  {company ? "Update company" : "Create company"}
                </Button>
                {companyError ? (
                  <Alert type="error" showIcon message={companyError} />
                ) : null}
              </Form>
            ) : (
              <Typography.Text type="secondary">
                {company?.name ?? "No company set yet."}
              </Typography.Text>
            )}
          </div>

          {profile?.role === "admin" ? (
            <div>
              <Typography.Title level={4} style={{ marginBottom: 8 }}>
                Invite a teammate
              </Typography.Title>
              <Form form={inviteForm} layout="vertical">
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ required: true, message: "Enter an email address." }]}
                >
                  <Input placeholder="teammate@company.com" />
                </Form.Item>
                <Button type="primary" onClick={handleInvite}>
                  Send invite
                </Button>
                {inviteError ? (
                  <Alert type="error" showIcon message={inviteError} />
                ) : null}
              </Form>
            </div>
          ) : null}
        </Space>
      </Card>

      <Card className="section-card" title="Company roster">
        <Table
          rowKey="id"
          dataSource={profiles}
          loading={loading}
          columns={[
            {
              title: "Name",
              dataIndex: "full_name",
              render: (value: string | null, record: Profile) =>
                value ?? record.id,
            },
            {
              title: "Phone",
              dataIndex: "phone",
              render: (value: string | null) => value ?? "-",
            },
            {
              title: "Role",
              dataIndex: "role",
              render: (value: Profile["role"]) => (
                <Tag color="default">{value}</Tag>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
