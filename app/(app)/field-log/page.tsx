"use client";

import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import {
  createAttachment,
  createTask,
  createUploadUrl,
  createWorkLog,
  getProjectTasks,
  getProjects,
} from "@/api/endpoints";
import type { Project, Task } from "@/api/types";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/components/session-provider";
import { taskApprovalStatusColor } from "@/lib/status";

type TaskMode = "existing" | "new";

type FieldLogValues = {
  project_id?: string;
  task_id?: string;
  task_title?: string;
  task_unit?: string;
  approval_status?: Task["approval_status"];
  log_date?: Dayjs;
  qty_done?: number;
  hours?: number;
  note?: string;
  attachment_kind?: string;
};

export default function FieldLogPage() {
  const { token, profile } = useSession();
  const isMember = profile?.role === "member";
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [taskMode, setTaskMode] = useState<TaskMode>("existing");
  const [addWorkLog, setAddWorkLog] = useState(true);
  const [addAttachment, setAddAttachment] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [form] = Form.useForm<FieldLogValues>();

  const selectedProjectId = Form.useWatch("project_id", form);

  useEffect(() => {
    if (!token) return;
    setLoadingProjects(true);
    getProjects(token)
      .then((data) => {
        setProjects(data);
        if (data.length && !form.getFieldValue("project_id")) {
          form.setFieldsValue({ project_id: data[0].id });
        }
      })
      .catch(() => setProjects([]))
      .finally(() => setLoadingProjects(false));
  }, [form, token]);

  useEffect(() => {
    if (!token || !selectedProjectId) {
      setTasks([]);
      return;
    }
    setLoadingTasks(true);
    getProjectTasks(token, selectedProjectId)
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setLoadingTasks(false));
  }, [selectedProjectId, token]);

  useEffect(() => {
    if (taskMode === "existing") {
      form.setFieldsValue({ task_title: undefined, task_unit: undefined });
    } else {
      form.setFieldsValue({ task_id: undefined });
    }
  }, [form, taskMode]);

  useEffect(() => {
    if (!addWorkLog) {
      form.setFieldsValue({
        log_date: undefined,
        qty_done: undefined,
        hours: undefined,
        note: undefined,
      });
      return;
    }
    if (!form.getFieldValue("log_date")) {
      form.setFieldsValue({ log_date: dayjs() });
    }
  }, [addWorkLog, form]);

  useEffect(() => {
    if (!addAttachment) {
      setAttachmentFile(null);
    }
  }, [addAttachment]);

  const attachmentList = useMemo<UploadFile[]>(() => {
    if (!attachmentFile) return [];
    return [
      {
        uid: attachmentFile.name,
        name: attachmentFile.name,
        size: attachmentFile.size,
        type: attachmentFile.type,
        status: "done",
      },
    ];
  }, [attachmentFile]);

  const taskOptions = useMemo(
    () =>
      tasks.map((task) => ({
        value: task.id,
        label: (
          <Space size="small">
            <span>{task.title}</span>
            <Tag color={taskApprovalStatusColor(task.approval_status)}>
              {task.approval_status.replace("_", " ")}
            </Tag>
          </Space>
        ),
      })),
    [tasks],
  );

  const resetForm = (projectId?: string) => {
    form.resetFields();
    form.setFieldsValue({
      project_id: projectId,
      approval_status: isMember ? "draft" : "approved",
      attachment_kind: "photo",
      log_date: addWorkLog ? dayjs() : undefined,
    });
    setAttachmentFile(null);
  };

  const handleSubmit = async (values: FieldLogValues) => {
    if (!token) return;
    if (!values.project_id) {
      message.error("Select a project.");
      return;
    }
    if (addAttachment && !attachmentFile) {
      message.error("Select a file to upload.");
      return;
    }

    setSubmitting(true);
    try {
      let taskId = values.task_id ?? null;
      if (taskMode === "new") {
        if (!values.task_title || !values.task_unit) {
          throw new Error("Task title and unit are required.");
        }
        if (!profile?.id) {
          throw new Error("Profile is not ready yet.");
        }
        const approvalStatus = isMember
          ? values.approval_status ?? "draft"
          : "approved";
        const createdTask = await createTask(token, values.project_id, {
          title: values.task_title,
          unit: values.task_unit,
          status: "todo",
          approval_status: approvalStatus,
          assigned_to: profile.id,
        });
        taskId = createdTask.id;
      }

      if (!taskId) {
        throw new Error("Select or create a task first.");
      }

      let workLogId: string | null = null;
      if (addWorkLog) {
        if (!values.log_date) {
          throw new Error("Select a work log date.");
        }
        const workLog = await createWorkLog(token, taskId, {
          log_date: values.log_date.toISOString(),
          qty_done: values.qty_done ?? null,
          hours: values.hours ?? null,
          note: values.note ?? null,
        });
        workLogId = workLog.id;
      }

      if (addAttachment && attachmentFile) {
        const { url, path } = await createUploadUrl(token, {
          filename: attachmentFile.name,
          task_id: taskId,
        });
        const response = await fetch(url, {
          method: "PUT",
          body: attachmentFile,
          headers: {
            "Content-Type": attachmentFile.type || "application/octet-stream",
          },
        });
        if (!response.ok) {
          throw new Error("Attachment upload failed.");
        }
        await createAttachment(token, {
          path,
          project_id: values.project_id,
          task_id: taskId,
          work_log_id: workLogId ?? null,
          kind: values.attachment_kind ?? "photo",
        });
      }

      message.success("Field log saved.");
      resetForm(values.project_id);
      if (selectedProjectId) {
        getProjectTasks(token, selectedProjectId)
          .then(setTasks)
          .catch(() => setTasks([]));
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-body">
      <PageHeader
        title="Field Log"
        subtitle="Capture tasks, work logs, and attachments in one pass."
      />

      <Card className="section-card field-log-card">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            approval_status: "draft",
            attachment_kind: "photo",
            log_date: dayjs(),
          }}
          onFinish={handleSubmit}
        >
          <div className="field-log-section">
            <Typography.Text className="field-log-section-title">
              Task entry
            </Typography.Text>
            <Space direction="vertical" size="middle" className="form-stack">
              <Form.Item
                label="Project"
                name="project_id"
                rules={[{ required: true, message: "Select a project." }]}
              >
                <Select
                  placeholder="Select project"
                  loading={loadingProjects}
                  options={projects.map((project) => ({
                    value: project.id,
                    label: project.name,
                  }))}
                />
              </Form.Item>

              <Form.Item label="Task mode">
                <Radio.Group
                  value={taskMode}
                  onChange={(event) =>
                    setTaskMode(event.target.value as TaskMode)
                  }
                  optionType="button"
                  buttonStyle="solid"
                >
                  <Radio.Button value="existing">Use existing</Radio.Button>
                  <Radio.Button value="new">Create new</Radio.Button>
                </Radio.Group>
              </Form.Item>

              {taskMode === "existing" ? (
                <Form.Item
                  label="Task"
                  name="task_id"
                  rules={[{ required: true, message: "Select a task." }]}
                >
                  <Select
                    placeholder={
                      selectedProjectId
                        ? "Select task"
                        : "Select a project first"
                    }
                    disabled={!selectedProjectId}
                    loading={loadingTasks}
                    options={taskOptions}
                  />
                </Form.Item>
              ) : (
                <>
                  <div className="field-log-grid">
                    <Form.Item
                      label="Task title"
                      name="task_title"
                      rules={[
                        { required: true, message: "Enter a task title." },
                      ]}
                    >
                      <Input placeholder="Install rebar at slab edge" />
                    </Form.Item>
                    <Form.Item
                      label="Unit"
                      name="task_unit"
                      rules={[{ required: true, message: "Enter a unit." }]}
                    >
                      <Input placeholder="sqm, hours, pieces" />
                    </Form.Item>
                  </div>
                  {isMember ? (
                    <Form.Item
                      label="Submission"
                      name="approval_status"
                      rules={[
                        {
                          required: true,
                          message: "Choose draft or pending.",
                        },
                      ]}
                    >
                      <Radio.Group optionType="button" buttonStyle="solid">
                        <Radio.Button value="draft">Save draft</Radio.Button>
                        <Radio.Button value="pending">
                          Submit for approval
                        </Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  ) : (
                    <Typography.Text className="field-log-helper">
                      Manager entries are auto-approved.
                    </Typography.Text>
                  )}
                </>
              )}
            </Space>
          </div>

          <div className="field-log-section">
            <div className="field-log-section-header">
              <Typography.Text className="field-log-section-title">
                Work log
              </Typography.Text>
              <Switch checked={addWorkLog} onChange={setAddWorkLog} />
            </div>
            {addWorkLog ? (
              <div className="field-log-grid">
                <Form.Item
                  label="Log date"
                  name="log_date"
                  rules={[{ required: true, message: "Select a log date." }]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="Quantity done" name="qty_done">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="Hours" name="hours">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="Notes" name="note" className="field-log-notes">
                  <Input.TextArea rows={3} placeholder="Crew size, blockers..." />
                </Form.Item>
              </div>
            ) : (
              <Typography.Text className="field-log-helper">
                Skip work logs for now.
              </Typography.Text>
            )}
          </div>

          <div className="field-log-section">
            <div className="field-log-section-header">
              <Typography.Text className="field-log-section-title">
                Attachment
              </Typography.Text>
              <Switch checked={addAttachment} onChange={setAddAttachment} />
            </div>
            {addAttachment ? (
              <Space direction="vertical" size="middle" className="form-stack">
                <Form.Item label="Attachment type" name="attachment_kind">
                  <Select
                    options={[
                      { value: "photo", label: "Photo" },
                      { value: "document", label: "Document" },
                      { value: "other", label: "Other" },
                    ]}
                    style={{ maxWidth: 240 }}
                  />
                </Form.Item>
                <Upload
                  beforeUpload={(file) => {
                    setAttachmentFile(file);
                    return false;
                  }}
                  onRemove={() => setAttachmentFile(null)}
                  fileList={attachmentList}
                  maxCount={1}
                >
                  <Button>Select file</Button>
                </Upload>
              </Space>
            ) : (
              <Typography.Text className="field-log-helper">
                Attach a photo or document if needed.
              </Typography.Text>
            )}
          </div>

          <div className="field-log-actions">
            <Button onClick={() => resetForm(selectedProjectId)}>
              Clear form
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Save field log
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
