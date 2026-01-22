"use client";

import { Button, Card, Form, Input, Modal, Space, Table, Tag, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveWorkLog,
  getPendingApprovals,
  getTask,
  rejectWorkLog,
} from "@/api/endpoints";
import type { Task, WorkLog } from "@/api/types";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/components/session-provider";
import { formatDate, formatNumber } from "@/lib/format";
import { workLogStatusColor } from "@/lib/status";

export default function ApprovalsPage() {
  const { token } = useSession();
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [taskLookup, setTaskLookup] = useState<Record<string, Task>>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [action, setAction] = useState<"approve" | "reject">("approve");
  const [selectedLog, setSelectedLog] = useState<WorkLog | null>(null);
  const [form] = Form.useForm();

  const loadApprovals = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const logs = await getPendingApprovals(token);
      setWorkLogs(logs);
      const taskIds = Array.from(new Set(logs.map((log) => log.task_id)));
      const taskPairs = await Promise.all(
        taskIds.map(
          async (taskId) => [taskId, await getTask(token, taskId)] as const,
        ),
      );
      const lookup: Record<string, Task> = {};
      taskPairs.forEach(([taskId, task]) => {
        lookup[taskId] = task;
      });
      setTaskLookup(lookup);
    } catch {
      setWorkLogs([]);
      setTaskLookup({});
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  const openActionModal = (log: WorkLog, nextAction: "approve" | "reject") => {
    setSelectedLog(log);
    setAction(nextAction);
    form.resetFields();
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!token || !selectedLog) return;
    const values = await form.validateFields();
    if (action === "approve") {
      await approveWorkLog(token, selectedLog.id, {
        note: values.note || undefined,
      });
    } else {
      await rejectWorkLog(token, selectedLog.id, {
        note: values.note,
      });
    }
    setModalOpen(false);
    loadApprovals();
  };

  const columns = useMemo(
    () => [
      {
        title: "Task",
        dataIndex: "task_id",
        render: (value: string) => taskLookup[value]?.title ?? value,
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
            <Button type="link" onClick={() => openActionModal(record, "approve")}>
              Approve
            </Button>
            <Button danger type="link" onClick={() => openActionModal(record, "reject")}>
              Reject
            </Button>
          </Space>
        ),
      },
    ],
    [taskLookup],
  );

  return (
    <div className="page-body">
      <PageHeader
        title="Approvals"
        subtitle="Review pending work logs and keep progress data clean."
      />

      <Card className="section-card">
        {workLogs.length || loading ? (
          <Table
            rowKey="id"
            dataSource={workLogs}
            columns={columns}
            loading={loading}
          />
        ) : (
          <Typography.Text type="secondary">
            No approvals waiting. Keep your crew moving.
          </Typography.Text>
        )}
      </Card>

      <Modal
        title={action === "approve" ? "Approve work log" : "Reject work log"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText={action === "approve" ? "Approve" : "Reject"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={action === "approve" ? "Note (optional)" : "Rejection note"}
            name="note"
            rules={
              action === "reject"
                ? [{ required: true, message: "Provide a rejection note." }]
                : []
            }
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
