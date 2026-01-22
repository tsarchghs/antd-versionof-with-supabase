"use client";

import { Card, Select, Space, Table, Tag, Typography } from "antd";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getProjectTasks, getProjects } from "@/api/endpoints";
import type { Project, Task } from "@/api/types";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/components/session-provider";
import { formatDate, formatNumber } from "@/lib/format";
import { taskApprovalStatusColor, taskStatusColor } from "@/lib/status";

export default function TasksPage() {
  const { token } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, [token]);

  useEffect(() => {
    if (!token || !selectedProjectId) {
      setTasks([]);
      return;
    }
    setLoading(true);
    getProjectTasks(token, selectedProjectId)
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [token, selectedProjectId]);

  const columns = useMemo(
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
        title: "Approval",
        dataIndex: "approval_status",
        render: (value: Task["approval_status"]) => (
          <Tag color={taskApprovalStatusColor(value)}>{value.replace("_", " ")}</Tag>
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
      {
        title: "Actions",
        key: "actions",
        render: () =>
          selectedProjectId ? (
            <Link href={`/projects/${selectedProjectId}`}>Open project</Link>
          ) : null,
      },
    ],
    [selectedProjectId],
  );

  return (
    <div className="page-body">
      <PageHeader
        title="Tasks"
        subtitle="Track execution by scope, unit, and progress status."
      />

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
          {selectedProjectId ? (
            <Table
              rowKey="id"
              dataSource={tasks}
              columns={columns}
              loading={loading}
            />
          ) : (
            <Typography.Text type="secondary">
              Select a project to view its tasks.
            </Typography.Text>
          )}
        </Space>
      </Card>
    </div>
  );
}
