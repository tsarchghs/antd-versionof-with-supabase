"use client";

import { Card, Col, Row, Skeleton, Space, Statistic, Table, Tag, Typography } from "antd";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDashboardSummary, getProjects } from "@/api/endpoints";
import type { DashboardSummary, Project } from "@/api/types";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/components/session-provider";
import { formatDate } from "@/lib/format";
import { projectStatusColor } from "@/lib/status";

export default function DashboardPage() {
  const { token, profile } = useSession();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      return;
    }
    let active = true;
    setLoading(true);
    Promise.all([getDashboardSummary(token), getProjects(token)])
      .then(([summaryData, projectsData]) => {
        if (!active) return;
        setSummary(summaryData);
        setProjects(projectsData);
      })
      .catch(() => {
        if (!active) return;
        setSummary(null);
        setProjects([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const projectColumns = useMemo(
    () => [
      {
        title: "Project",
        dataIndex: "name",
        render: (value: string, record: Project) => (
          <Link href={`/projects/${record.id}`}>{value}</Link>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        render: (value: Project["status"]) => (
          <Tag color={projectStatusColor(value)}>
            {value.replace("_", " ")}
          </Tag>
        ),
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
        title="Dashboard"
        subtitle="Live metrics and project momentum across your company."
        extra={
          <Space>
            <Link href="/projects" className="app-link">
              View projects
            </Link>
            {profile?.role === "manager" || profile?.role === "admin" ? (
              <Link href="/projects" className="app-primary-link">
                Create project
              </Link>
            ) : null}
          </Space>
        }
      />

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} xl={6}>
              <Card className="metric-card">
                <Statistic
                  title="Total hours"
                  value={summary?.total_hours ?? 0}
                />
              </Card>
            </Col>
            <Col xs={24} md={12} xl={6}>
              <Card className="metric-card">
                <Statistic
                  title="Total quantity"
                  value={summary?.total_qty ?? 0}
                />
              </Card>
            </Col>
            <Col xs={24} md={12} xl={6}>
              <Card className="metric-card">
                <Statistic
                  title="Pending approvals"
                  value={summary?.pending_approvals ?? 0}
                />
              </Card>
            </Col>
            <Col xs={24} md={12} xl={6}>
              <Card className="metric-card">
                <Statistic
                  title="Rejected logs"
                  value={summary?.rejected_count ?? 0}
                />
              </Card>
            </Col>
          </Row>

          <Card className="section-card" title="Active projects">
            {projects.length ? (
              <Table
                rowKey="id"
                dataSource={projects}
                columns={projectColumns}
                pagination={{ pageSize: 6 }}
              />
            ) : (
              <Typography.Text type="secondary">
                No projects yet. Start by creating the first project.
              </Typography.Text>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
