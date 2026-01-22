"use client";

import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  Upload,
} from "antd";
import type { UploadRequestOption } from "rc-upload/lib/interface";
import dayjs from "dayjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addProjectMember,
  approveTask,
  createAttachment,
  createTask,
  createUploadUrl,
  createWorkLog,
  deleteAttachment,
  deleteTask,
  deleteWorkLog,
  approveWorkLog,
  getAttachments,
  getProfilesCompany,
  getProject,
  getProjectMembers,
  getProjectTasks,
  getProjectWorkLogs,
  rejectWorkLog,
  removeProjectMember,
  updateProjectMember,
  updateTask,
  updateWorkLog,
} from "@/api/endpoints";
import type {
  Attachment,
  Profile,
  Project,
  ProjectMember,
  Task,
  WorkLog,
} from "@/api/types";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/components/session-provider";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";
import { taskApprovalStatusColor, taskStatusColor, workLogStatusColor } from "@/lib/status";

const taskStatusOptions: Task["status"][] = [
  "todo",
  "in_progress",
  "blocked",
  "done",
];

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { token, profile } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [companyProfiles, setCompanyProfiles] = useState<Profile[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [attachmentKind, setAttachmentKind] = useState("photo");
  const [loading, setLoading] = useState(true);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm] = Form.useForm();

  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ProjectMember | null>(null);
  const [memberForm] = Form.useForm();

  const [workLogModalOpen, setWorkLogModalOpen] = useState(false);
  const [editingWorkLog, setEditingWorkLog] = useState<WorkLog | null>(null);
  const [workLogForm] = Form.useForm();

  const canManage = profile?.role === "manager" || profile?.role === "admin";
  const isMember = profile?.role === "member";
  const taskLabel = isMember ? "My tasks" : "Tasks";
  const workLogLabel = isMember ? "My work logs" : "Work logs";
  const attachmentLabel = isMember ? "My attachments" : "Attachments";

  const loadProjectData = useCallback(() => {
    if (!token) return;
    let active = true;
    setLoading(true);
    Promise.all([
      getProject(token, projectId),
      getProjectTasks(token, projectId),
      getProjectMembers(token, projectId),
      getProjectWorkLogs(token, projectId),
    ])
      .then(([projectData, taskData, memberData, workLogData]) => {
        if (!active) return;
        setProject(projectData);
        setTasks(taskData);
        setMembers(memberData);
        setWorkLogs(workLogData);
        if (taskData.length) {
          setSelectedTaskId((current) => {
            if (!current) return taskData[0].id;
            return taskData.some((task) => task.id === current)
              ? current
              : taskData[0].id;
          });
        }
      })
      .catch(() => {
        if (!active) return;
        setProject(null);
        setTasks([]);
        setMembers([]);
        setWorkLogs([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    if (canManage) {
      getProfilesCompany(token)
        .then(setCompanyProfiles)
        .catch(() => setCompanyProfiles([]));
    }

    return () => {
      active = false;
    };
  }, [canManage, projectId, token]);

  useEffect(() => loadProjectData(), [loadProjectData]);

  useEffect(() => {
    if (!token || !selectedTaskId) {
      return;
    }
    setAttachmentsLoading(true);
    getAttachments(token, selectedTaskId)
      .then(setAttachments)
      .catch(() => setAttachments([]))
      .finally(() => setAttachmentsLoading(false));
  }, [token, selectedTaskId]);

  const profileLookup = useMemo(() => {
    const map = new Map<string, Profile>();
    companyProfiles.forEach((item) => map.set(item.id, item));
    return map;
  }, [companyProfiles]);

  const taskLookup = useMemo(() => {
    const map = new Map<string, Task>();
    tasks.forEach((item) => map.set(item.id, item));
    return map;
  }, [tasks]);

  const openTaskModal = (task?: Task) => {
    setEditingTask(task ?? null);
    setTaskModalOpen(true);
    if (task) {
      taskForm.setFieldsValue({
        title: task.title,
        unit: task.unit,
        planned_qty: task.planned_qty,
        planned_hours: task.planned_hours,
        status: task.status,
        assigned_to: task.assigned_to ?? undefined,
        start_date: task.start_date ? dayjs(task.start_date) : null,
        end_date: task.end_date ? dayjs(task.end_date) : null,
      });
    } else {
      taskForm.resetFields();
      taskForm.setFieldsValue({ status: "todo" });
    }
  };

  const handleTaskSubmit = async () => {
    if (!token) return;
    const values = await taskForm.validateFields();
    const payload = {
      title: values.title,
      unit: values.unit,
      planned_qty: values.planned_qty ?? null,
      planned_hours: values.planned_hours ?? null,
      status: values.status as Task["status"],
      assigned_to: values.assigned_to ?? null,
      start_date: values.start_date?.toISOString() ?? null,
      end_date: values.end_date?.toISOString() ?? null,
    };
    if (editingTask) {
      await updateTask(token, editingTask.id, payload);
    } else {
      await createTask(token, projectId, payload);
    }
    setTaskModalOpen(false);
    loadProjectData();
  };

  const handleDeleteTask = (taskId: string) => {
    if (!token) return;
    Modal.confirm({
      title: "Delete task?",
      content: "This removes the task and any associated logs.",
      okType: "danger",
      onOk: async () => {
        await deleteTask(token, taskId);
        loadProjectData();
      },
    });
  };

  const handleApproveTask = useCallback(
    async (taskId: string) => {
      if (!token) return;
      await approveTask(token, taskId);
      loadProjectData();
    },
    [loadProjectData, token],
  );

  const handleSubmitTask = useCallback(
    async (taskId: string) => {
      if (!token) return;
      await updateTask(token, taskId, { approval_status: "pending" });
      loadProjectData();
    },
    [loadProjectData, token],
  );

  const openMemberModal = (member?: ProjectMember) => {
    setEditingMember(member ?? null);
    setMemberModalOpen(true);
    if (member) {
      memberForm.setFieldsValue({
        user_id: member.user_id,
        member_role: member.member_role,
      });
    } else {
      memberForm.resetFields();
    }
  };

  const handleMemberSubmit = async () => {
    if (!token) return;
    const values = await memberForm.validateFields();
    if (editingMember) {
      await updateProjectMember(token, projectId, editingMember.user_id, {
        member_role: values.member_role,
      });
    } else {
      await addProjectMember(token, projectId, {
        user_id: values.user_id,
        member_role: values.member_role,
      });
    }
    setMemberModalOpen(false);
    loadProjectData();
  };

  const handleDeleteMember = (userId: string) => {
    if (!token) return;
    Modal.confirm({
      title: "Remove member?",
      content: "They will lose access to this project.",
      okType: "danger",
      onOk: async () => {
        await removeProjectMember(token, projectId, userId);
        loadProjectData();
      },
    });
  };

  const openWorkLogModal = (workLog?: WorkLog, taskId?: string) => {
    setEditingWorkLog(workLog ?? null);
    setWorkLogModalOpen(true);
    if (workLog) {
      workLogForm.setFieldsValue({
        task_id: workLog.task_id,
        log_date: workLog.log_date ? dayjs(workLog.log_date) : null,
        qty_done: workLog.qty_done,
        hours: workLog.hours,
        note: workLog.note,
      });
    } else {
      workLogForm.resetFields();
      workLogForm.setFieldsValue({
        task_id: taskId ?? undefined,
        log_date: dayjs(),
      });
    }
  };

  const handleWorkLogSubmit = async () => {
    if (!token) return;
    const values = await workLogForm.validateFields();
    const payload = {
      log_date: values.log_date.toISOString(),
      qty_done: values.qty_done ?? null,
      hours: values.hours ?? null,
      note: values.note ?? null,
    };
    if (editingWorkLog) {
      await updateWorkLog(token, editingWorkLog.id, payload);
    } else {
      await createWorkLog(token, values.task_id, payload);
    }
    setWorkLogModalOpen(false);
    loadProjectData();
  };

  const handleDeleteWorkLog = (workLogId: string) => {
    if (!token) return;
    Modal.confirm({
      title: "Delete work log?",
      content: "Only pending logs can be deleted.",
      okType: "danger",
      onOk: async () => {
        await deleteWorkLog(token, workLogId);
        loadProjectData();
      },
    });
  };

  const handleApproveWorkLog = useCallback(
    async (workLogId: string) => {
      if (!token) return;
      await approveWorkLog(token, workLogId, {});
      loadProjectData();
    },
    [loadProjectData, token],
  );

  const handleRejectWorkLog = useCallback(
    async (workLogId: string) => {
      if (!token) return;
      Modal.confirm({
        title: "Reject work log?",
        content: "Provide a rejection reason in the approvals view.",
        okType: "danger",
        onOk: async () => {
          await rejectWorkLog(token, workLogId, { note: "Rejected" });
          loadProjectData();
        },
      });
    },
    [loadProjectData, token],
  );


  const handleAttachmentUpload = async (options: UploadRequestOption) => {
    if (!token || !project || !selectedTaskId) {
      return;
    }
    try {
      const file = options.file as File;
      const { url, path } = await createUploadUrl(token, {
        filename: file.name,
        task_id: selectedTaskId,
      });
      const response = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });
      if (!response.ok) {
        options.onError?.(new Error("Upload failed"));
        return;
      }
      await createAttachment(token, {
        path,
        project_id: project.id,
        task_id: selectedTaskId,
        kind: attachmentKind,
      });
      if (token) {
        const refreshed = await getAttachments(token, selectedTaskId);
        setAttachments(refreshed);
      }
      options.onSuccess?.({}, file);
    } catch (error) {
      options.onError?.(error as Error);
    }
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    if (!token) return;
    Modal.confirm({
      title: "Delete attachment?",
      content: "This file will be removed from the task.",
      okType: "danger",
      onOk: async () => {
        await deleteAttachment(token, attachmentId);
        if (selectedTaskId) {
          const refreshed = await getAttachments(token, selectedTaskId);
          setAttachments(refreshed);
        }
      },
    });
  };

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
        title: "Approval",
        dataIndex: "approval_status",
        render: (value: Task["approval_status"]) => (
          <Tag color={taskApprovalStatusColor(value)}>{value.replace("_", " ")}</Tag>
        ),
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
        title: "Assigned to",
        dataIndex: "assigned_to",
        render: (value: string | null) =>
          value ? profileLookup.get(value)?.full_name ?? value : "—",
      },
      {
        title: "Actions",
        key: "actions",
        render: (_: unknown, record: Task) => (
          <Space>
            <Button type="link" onClick={() => openWorkLogModal(undefined, record.id)}>
              Log work
            </Button>
            {!canManage && record.approval_status === "draft" ? (
              <Button type="link" onClick={() => handleSubmitTask(record.id)}>
                Submit
              </Button>
            ) : null}
            {canManage && record.approval_status === "pending" ? (
              <Button type="link" onClick={() => handleApproveTask(record.id)}>
                Approve
              </Button>
            ) : null}
            {canManage ? (
              <Button type="link" onClick={() => openTaskModal(record)}>
                Edit
              </Button>
            ) : null}
            {canManage ? (
              <Button danger type="link" onClick={() => handleDeleteTask(record.id)}>
                Delete
              </Button>
            ) : null}
          </Space>
        ),
      },
    ],
    [canManage, handleApproveTask, handleSubmitTask, profileLookup],
  );

  const memberColumns = useMemo(
    () => [
      {
        title: "Member",
        dataIndex: "user_id",
        render: (value: string) =>
          profileLookup.get(value)?.full_name ?? value,
      },
      {
        title: "Role",
        dataIndex: "member_role",
      },
      {
        title: "Actions",
        key: "actions",
        render: (_: unknown, record: ProjectMember) =>
          canManage ? (
            <Space>
              <Button type="link" onClick={() => openMemberModal(record)}>
                Update
              </Button>
              <Button danger type="link" onClick={() => handleDeleteMember(record.user_id)}>
                Remove
              </Button>
            </Space>
          ) : null,
      },
    ],
    [canManage, profileLookup],
  );

  const workLogColumns = useMemo(
    () => [
      {
        title: "Task",
        dataIndex: "task_id",
        render: (value: string) => taskLookup.get(value)?.title ?? value,
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
      {
        title: "Actions",
        key: "actions",
        render: (_: unknown, record: WorkLog) => (
          <Space>
            {canManage && record.status === "pending" ? (
              <>
                <Button type="link" onClick={() => handleApproveWorkLog(record.id)}>
                  Approve
                </Button>
                <Button danger type="link" onClick={() => handleRejectWorkLog(record.id)}>
                  Reject
                </Button>
              </>
            ) : null}
            {record.status === "pending" ? (
              <>
                <Button type="link" onClick={() => openWorkLogModal(record)}>
                  Edit
                </Button>
                <Button danger type="link" onClick={() => handleDeleteWorkLog(record.id)}>
                  Delete
                </Button>
              </>
            ) : null}
          </Space>
        ),
      },
    ],
    [canManage, handleApproveWorkLog, handleRejectWorkLog, taskLookup],
  );

  const attachmentColumns = useMemo(
    () => [
      {
        title: "File path",
        dataIndex: "path",
        render: (value: string) => (
          <Typography.Text ellipsis style={{ maxWidth: 260 }}>
            {value}
          </Typography.Text>
        ),
      },
      {
        title: "Kind",
        dataIndex: "kind",
      },
      {
        title: "Created",
        dataIndex: "created_at",
        render: (value: string | undefined) => formatDateTime(value),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_: unknown, record: Attachment) => (
          <Button danger type="link" onClick={() => handleDeleteAttachment(record.id)}>
            Delete
          </Button>
        ),
      },
    ],
    [],
  );

  if (loading) {
    return (
      <div className="page-body">
        <Typography.Text type="secondary">Loading project...</Typography.Text>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page-body">
        <Typography.Text type="secondary">
          Project not found. Return to{" "}
          <Link href="/projects" className="app-link">
            projects
          </Link>
          .
        </Typography.Text>
      </div>
    );
  }

  return (
    <div className="page-body">
      <PageHeader
        title={project.name}
        subtitle="Tasks, members, logs, and attachments for this project."
        extra={
          <Space>
            <Link href="/projects" className="app-link">
              Back to projects
            </Link>
            {canManage ? (
              <Button type="primary" onClick={() => openTaskModal()}>
                New task
              </Button>
            ) : null}
          </Space>
        }
      />

      <Tabs
        items={[
          {
            key: "tasks",
            label: taskLabel,
            children: (
              <Card className="section-card">
                <Table rowKey="id" dataSource={tasks} columns={taskColumns} />
              </Card>
            ),
          },
          ...(!isMember
            ? [
                {
                  key: "members",
                  label: "Members",
                  children: (
                    <Card className="section-card">
                      {canManage ? (
                        <Space style={{ marginBottom: 16 }}>
                          <Button type="primary" onClick={() => openMemberModal()}>
                            Add member
                          </Button>
                        </Space>
                      ) : null}
                      <Table rowKey="user_id" dataSource={members} columns={memberColumns} />
                    </Card>
                  ),
                },
              ]
            : []),
          {
            key: "logs",
            label: workLogLabel,
            children: (
              <Card className="section-card">
                <Table rowKey="id" dataSource={workLogs} columns={workLogColumns} />
              </Card>
            ),
          },
          {
            key: "attachments",
            label: attachmentLabel,
            children: (
              <Card className="section-card">
                <Space direction="vertical" size="middle" className="form-stack">
                  <Space wrap>
                    <Select
                      placeholder="Select task"
                      value={selectedTaskId ?? undefined}
                      onChange={(value) => setSelectedTaskId(value)}
                      style={{ minWidth: 220 }}
                      options={tasks.map((task) => ({
                        value: task.id,
                        label: task.title,
                      }))}
                    />
                    <Select
                      value={attachmentKind}
                      onChange={setAttachmentKind}
                      style={{ minWidth: 160 }}
                      options={[
                        { value: "photo", label: "Photo" },
                        { value: "document", label: "Document" },
                        { value: "other", label: "Other" },
                      ]}
                    />
                    <Upload
                      showUploadList={false}
                      customRequest={handleAttachmentUpload}
                      disabled={!selectedTaskId}
                    >
                      <Button type="primary" disabled={!selectedTaskId}>
                        Upload file
                      </Button>
                    </Upload>
                  </Space>
                  <Table
                    rowKey="id"
                    dataSource={attachments}
                    columns={attachmentColumns}
                    loading={attachmentsLoading}
                  />
                </Space>
              </Card>
            ),
          },
        ]}
      />

      <Modal
        title={editingTask ? "Edit task" : "Create task"}
        open={taskModalOpen}
        onCancel={() => setTaskModalOpen(false)}
        onOk={handleTaskSubmit}
        okText={editingTask ? "Save changes" : "Create"}
      >
        <Form form={taskForm} layout="vertical">
          <Form.Item
            label="Task title"
            name="title"
            rules={[{ required: true, message: "Enter a task title." }]}
          >
            <Input placeholder="Install facade panels" />
          </Form.Item>
          <Form.Item
            label="Unit"
            name="unit"
            rules={[{ required: true, message: "Enter a unit." }]}
          >
            <Input placeholder="sqm, hours, pieces" />
          </Form.Item>
          <Form.Item label="Planned quantity" name="planned_qty">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Planned hours" name="planned_hours">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Select status." }]}
          >
            <Select
              options={taskStatusOptions.map((value) => ({
                value,
                label: value.replace("_", " "),
              }))}
            />
          </Form.Item>
          <Form.Item label="Assigned to" name="assigned_to">
            <Select
              allowClear
              options={companyProfiles.map((person) => ({
                value: person.id,
                label: person.full_name ?? person.id,
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

      <Modal
        title={editingMember ? "Update member" : "Add member"}
        open={memberModalOpen}
        onCancel={() => setMemberModalOpen(false)}
        onOk={handleMemberSubmit}
        okText={editingMember ? "Update" : "Add"}
      >
        <Form form={memberForm} layout="vertical">
          <Form.Item
            label="User"
            name="user_id"
            rules={[{ required: true, message: "Select a user." }]}
          >
            <Select
              disabled={!!editingMember}
              options={companyProfiles.map((person) => ({
                value: person.id,
                label: person.full_name ?? person.id,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Project role"
            name="member_role"
            rules={[{ required: true, message: "Enter a role." }]}
          >
            <Input placeholder="Foreman, Electrician, Lead" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingWorkLog ? "Edit work log" : "Log work"}
        open={workLogModalOpen}
        onCancel={() => setWorkLogModalOpen(false)}
        onOk={handleWorkLogSubmit}
        okText={editingWorkLog ? "Save" : "Log"}
      >
        <Form form={workLogForm} layout="vertical">
          <Form.Item
            label="Task"
            name="task_id"
            rules={[{ required: true, message: "Select a task." }]}
          >
            <Select
              disabled={!!editingWorkLog}
              options={tasks.map((task) => ({
                value: task.id,
                label: task.title,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Log date"
            name="log_date"
            rules={[{ required: true, message: "Select date." }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Quantity done" name="qty_done">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Hours" name="hours">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Notes" name="note">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
