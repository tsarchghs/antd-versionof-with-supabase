"use client";

import { Button, Card, DatePicker, Form, Input, Modal, Select, Space, Table, Tag, Typography } from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from "@/api/endpoints";
import type { Project } from "@/api/types";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/components/session-provider";
import { formatDate } from "@/lib/format";
import { projectStatusColor } from "@/lib/status";

const statusOptions: Project["status"][] = [
  "planned",
  "active",
  "completed",
  "cancelled",
];

export default function ProjectsPage() {
  const { token, profile } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();

  const loadProjects = useCallback(() => {
    if (!token) {
      return;
    }
    setLoading(true);
    getProjects(token)
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => loadProjects(), [loadProjects]);

  const openModal = (project?: Project) => {
    setEditingProject(project ?? null);
    setModalOpen(true);
    if (project) {
      form.setFieldsValue({
        name: project.name,
        status: project.status,
        start_date: project.start_date ? dayjs(project.start_date) : null,
        end_date: project.end_date ? dayjs(project.end_date) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ status: "planned" });
    }
  };

  const handleDelete = (projectId: string) => {
    if (!token) return;
    Modal.confirm({
      title: "Delete project?",
      content: "This will permanently remove the project and its data.",
      okType: "danger",
      onOk: async () => {
        await deleteProject(token, projectId);
        loadProjects();
      },
    });
  };

  const handleSubmit = async () => {
    if (!token) return;
    const values = await form.validateFields();
    const payload = {
      name: values.name,
      status: values.status as Project["status"],
      start_date: values.start_date?.toISOString() ?? null,
      end_date: values.end_date?.toISOString() ?? null,
    };
    if (editingProject) {
      await updateProject(token, editingProject.id, payload);
    } else {
      await createProject(token, payload);
    }
    setModalOpen(false);
    loadProjects();
  };

  const columns = useMemo(
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
      {
        title: "Actions",
        key: "actions",
        render: (_: unknown, record: Project) => (
          <Space>
            <Link href={`/projects/${record.id}`}>Open</Link>
            {profile?.role === "manager" || profile?.role === "admin" ? (
              <Button type="link" onClick={() => openModal(record)}>
                Edit
              </Button>
            ) : null}
            {profile?.role === "admin" ? (
              <Button danger type="link" onClick={() => handleDelete(record.id)}>
                Delete
              </Button>
            ) : null}
          </Space>
        ),
      },
    ],
    [profile?.role],
  );

  return (
    <div className="page-body">
      <PageHeader
        title="Projects"
        subtitle="Plan, track, and deliver milestones across active sites."
        extra={
          profile?.role === "manager" || profile?.role === "admin" ? (
            <Button type="primary" onClick={() => openModal()}>
              New project
            </Button>
          ) : null
        }
      />

      <Card className="section-card">
        {projects.length || loading ? (
          <Table
            rowKey="id"
            dataSource={projects}
            columns={columns}
            loading={loading}
          />
        ) : (
          <Typography.Text type="secondary">
            No projects yet. Create your first project to get started.
          </Typography.Text>
        )}
      </Card>

      <Modal
        title={editingProject ? "Edit project" : "Create project"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText={editingProject ? "Save changes" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Project name"
            name="name"
            rules={[{ required: true, message: "Enter a project name." }]}
          >
            <Input placeholder="Downtown North Tower" />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Select status." }]}
          >
            <Select
              options={statusOptions.map((value) => ({
                value,
                label: value.replace("_", " "),
              }))}
            />
          </Form.Item>
          <Form.Item label="Start date" name="start_date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="End date" name="end_date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
