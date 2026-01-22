"use client";

import { Card, Col, Row, Select, Space, Statistic, Table, Tabs, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import {
  getCompanyReport,
  getProfilesCompany,
  getProjectReport,
  getProjects,
  getUserReport,
} from "@/api/endpoints";
import type {
  CompanyReport,
  Profile,
  Project,
  ProjectReport,
  Task,
  UserReport,
  WorkLog,
} from "@/api/types";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/components/session-provider";
import { formatDate, formatNumber } from "@/lib/format";
import { taskStatusColor, workLogStatusColor } from "@/lib/status";

export default function ReportsPage() {
  const { token, profile } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [projectReport, setProjectReport] = useState<ProjectReport | null>(null);
  const [userReport, setUserReport] = useState<UserReport | null>(null);
  const [companyReport, setCompanyReport] = useState<CompanyReport | null>(null);

  useEffect(() => {
    if (!token) return;
    getProjects(token)
      .then((data) => {
        setProjects(data);
        if (data.length) {
          setSelectedProjectId((current) => current ?? data[0].id);
        }
      })
      .catch(() => setProjects([]));
    if (profile?.role !== "member") {
      getProfilesCompany(token)
        .then((data) => {
          setProfiles(data);
          if (data.length) {
          setSelectedUserId((current) => current ?? data[0].id);
          }
        })
        .catch(() => setProfiles([]));
    }
    getCompanyReport(token).then(setCompanyReport).catch(() => setCompanyReport(null));
  }, [token, profile?.role]);

  useEffect(() => {
    if (profile?.role === "member" && profile.id && !selectedUserId) {
      setSelectedUserId(profile.id);
    }
  }, [profile, selectedUserId]);

  useEffect(() => {
    if (!token || !selectedProjectId) return;
    getProjectReport(token, selectedProjectId)
      .then(setProjectReport)
      .catch(() => setProjectReport(null));
  }, [token, selectedProjectId]);

  useEffect(() => {
    if (!token || !selectedUserId) return;
    getUserReport(token, selectedUserId)
      .then(setUserReport)
      .catch(() => setUserReport(null));
  }, [token, selectedUserId]);

  const taskColumns = useMemo(
    () => [
      {
        title: "Task",
        dataIndex: "title",
      },
      {
        title: "Status",
        dataIndex: "status",
        render: (value: Task["status"]) => (
          <Tag color={taskStatusColor(value)}>{value.replace("_", " ")}</Tag>
        ),
      },
      {
        title: "Unit",
        dataIndex: "unit",
      },
      {
        title: "Planned qty",
        dataIndex: "planned_qty",
        render: (value: number | null) => formatNumber(value ?? undefined),
      },
      {
        title: "Planned hours",
        dataIndex: "planned_hours",
        render: (value: number | null) => formatNumber(value ?? undefined),
      },
    ],
    [],
  );

  const workLogColumns = useMemo(
    () => [
      {
        title: "Task",
        dataIndex: "task_id",
      },
      {
        title: "Date",
        dataIndex: "log_date",
        render: (value: string) => formatDate(value),
      },
      {
        title: "Qty",
        dataIndex: "qty_done",
        render: (value: number | null) => formatNumber(value ?? undefined),
      },
      {
        title: "Hours",
        dataIndex: "hours",
        render: (value: number | null) => formatNumber(value ?? undefined),
      },
      {
        title: "Status",
        dataIndex: "status",
        render: (value: WorkLog["status"]) => (
          <Tag color={workLogStatusColor(value)}>{value}</Tag>
        ),
      },
    ],
    [],
  );

  const projectColumns = useMemo(
    () => [
      {
        title: "Project",
        dataIndex: "name",
      },
      {
        title: "Status",
        dataIndex: "status",
      },
      {
        title: "Start",
        dataIndex: "start_date",
        render: (value: string | null) => formatDate(value),
      },
      {
        title: "End",
        dataIndex: "end_date",
        render: (value: string | null) => formatDate(value),
      },
    ],
    [],
  );

  return (
    <div className="page-body">
      <PageHeader
        title="Reports"
        subtitle="Exportable insight across projects, people, and the entire company."
      />

      <Tabs
        items={[
          {
            key: "project",
            label: "Project",
            children: (
              <Card className="section-card">
                <Space direction="vertical" size="middle" className="form-stack">
                  <Select
                    placeholder="Select project"
                    value={selectedProjectId ?? undefined}
                    onChange={(value) => setSelectedProjectId(value)}
                    options={projects.map((project) => ({
                      value: project.id,
                      label: project.name,
                    }))}
                    style={{ maxWidth: 360 }}
                  />
                  {projectReport ? (
                    <>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                          <Statistic
                            title="Total hours"
                            value={projectReport.summary.total_hours}
                          />
                        </Col>
                        <Col xs={24} md={8}>
                          <Statistic
                            title="Total quantity"
                            value={projectReport.summary.total_qty}
                          />
                        </Col>
                        <Col xs={24} md={8}>
                          <Statistic
                            title="Pending approvals"
                            value={projectReport.summary.pending}
                          />
                        </Col>
                      </Row>
                      <Card className="nested-card" title="Tasks">
                        <Table
                          rowKey="id"
                          dataSource={projectReport.tasks}
                          columns={taskColumns}
                          pagination={{ pageSize: 6 }}
                        />
                      </Card>
                      <Card className="nested-card" title="Work logs">
                        <Table
                          rowKey="id"
                          dataSource={projectReport.work_logs}
                          columns={workLogColumns}
                          pagination={{ pageSize: 6 }}
                        />
                      </Card>
                    </>
                  ) : (
                    <Typography.Text type="secondary">
                      Select a project to generate the report.
                    </Typography.Text>
                  )}
                </Space>
              </Card>
            ),
          },
          {
            key: "user",
            label: "User",
            children: (
              <Card className="section-card">
                <Space direction="vertical" size="middle" className="form-stack">
                  <Select
                    placeholder="Select team member"
                    value={selectedUserId ?? undefined}
                    onChange={(value) => setSelectedUserId(value)}
                    options={(profile?.role === "member"
                      ? profile
                        ? [profile]
                        : []
                      : profiles
                    ).map((person) => ({
                      value: person.id,
                      label: person.full_name ?? person.id,
                    }))}
                    style={{ maxWidth: 360 }}
                    disabled={profile?.role === "member"}
                  />
                  {userReport ? (
                    <>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                          <Statistic
                            title="Total hours"
                            value={userReport.summary.total_hours}
                          />
                        </Col>
                        <Col xs={24} md={8}>
                          <Statistic
                            title="Total quantity"
                            value={userReport.summary.total_qty}
                          />
                        </Col>
                        <Col xs={24} md={8}>
                          <Statistic
                            title="Rejected logs"
                            value={userReport.summary.rejected}
                          />
                        </Col>
                      </Row>
                      <Card className="nested-card" title="Work logs">
                        <Table
                          rowKey="id"
                          dataSource={userReport.work_logs}
                          columns={workLogColumns}
                          pagination={{ pageSize: 6 }}
                        />
                      </Card>
                    </>
                  ) : (
                    <Typography.Text type="secondary">
                      Select a team member to generate the report.
                    </Typography.Text>
                  )}
                </Space>
              </Card>
            ),
          },
          {
            key: "company",
            label: "Company",
            children: (
              <Card className="section-card">
                {companyReport ? (
                  <Space direction="vertical" size="middle" className="form-stack">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={8}>
                        <Statistic
                          title="Total hours"
                          value={companyReport.summary.total_hours}
                        />
                      </Col>
                      <Col xs={24} md={8}>
                        <Statistic
                          title="Total quantity"
                          value={companyReport.summary.total_qty}
                        />
                      </Col>
                      <Col xs={24} md={8}>
                        <Statistic
                          title="Rejected logs"
                          value={companyReport.summary.rejected}
                        />
                      </Col>
                    </Row>
                    <Card className="nested-card" title="Projects">
                      <Table
                        rowKey="id"
                        dataSource={companyReport.projects}
                        columns={projectColumns}
                        pagination={{ pageSize: 6 }}
                      />
                    </Card>
                  </Space>
                ) : (
                  <Typography.Text type="secondary">
                    Company report not available.
                  </Typography.Text>
                )}
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
