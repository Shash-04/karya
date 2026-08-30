"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { ArrowLeft, Download, Paperclip, RotateCcw, ScrollText, Trash2, Upload } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge, TypeBadge } from "@/components/TypeBadge";
import { TaskFormModal } from "@/components/TaskFormModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Spinner } from "@/components/ui/Spinner";
import { useAttachments, useUploadAttachment } from "@/hooks/useAttachments";
import { useDeleteTask, useRetryTask, useTask } from "@/hooks/useTasks";
import { formatDateTime } from "@/lib/format";
import { saveAttachment } from "@/services/taskService";
import type { Attachment } from "@/lib/types";

export default function TaskDetailPage() {
  return (
    <AuthGuard>
      <AppShell>
        <TaskDetail />
      </AppShell>
    </AuthGuard>
  );
}

function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError } = useTask(id);
  const retry = useRetryTask();
  const del = useDeleteTask();
  const [editing, setEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  if (isError || !data) {
    return <p className="py-24 text-center text-sm text-red-500">Task not found.</p>;
  }

  const { task, logs } = data;

  async function onDelete() {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    await del.mutateAsync(task.id);
    router.push("/dashboard");
  }

  return (
    <div className="space-y-5">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{task.name}</h1>
            <StatusBadge status={task.status} />
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <span className="font-mono text-xs text-faint">ID: {task.id}</span>
            <TypeBadge type={task.type} />
          </div>
        </div>
        <div className="flex gap-2">
          {task.status === "PENDING" && (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
          {task.status === "FAILED" && (
            <Button onClick={() => retry.mutate(task.id)} disabled={retry.isPending}>
              {retry.isPending ? <Spinner className="h-4 w-4 text-white" /> : <RotateCcw className="h-4 w-4" />}
              Retry
            </Button>
          )}
          <Button variant="danger" onClick={onDelete} disabled={del.isPending}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <ProgressBar value={task.progress} status={task.status} />
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Field label="Priority" value={<PriorityBadge priority={task.priority} />} />
          <Field label="Attempts" value={String(task.attempts)} />
          <Field label="Scheduled" value={formatDateTime(task.scheduledAt)} />
          <Field label="Created" value={formatDateTime(task.createdAt)} />
          <Field label="Updated" value={formatDateTime(task.updatedAt)} />
        </dl>
        {task.errorMessage && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {task.errorMessage}
          </p>
        )}
        {task.payload != null && <JsonBlock label="Payload" value={task.payload} />}
        {task.result != null && <JsonBlock label="Execution Result Output" value={task.result} />}
      </Card>

      <AttachmentsCard taskId={task.id} />

      <Card className="p-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <ScrollText className="h-4 w-4 text-brand" /> Execution Audit Logs ({logs.length})
        </h2>
        {logs.length === 0 ? (
          <p className="py-6 text-center text-sm text-faint">No logs generated for this task yet.</p>
        ) : (
          <div className="tf-terminal tf-scroll overflow-x-auto rounded-lg p-4">
            <ol className="space-y-1.5 font-mono text-[12px]">
              {logs.map((log) => (
                <li key={log.id} className="flex flex-wrap gap-2">
                  <span className="text-stone-500">{formatDateTime(log.createdAt)}</span>
                  <span
                    className={`font-bold ${
                      log.level === "ERROR"
                        ? "text-red-400"
                        : log.level === "WARN"
                          ? "text-amber-400"
                          : "text-sky-400"
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-stone-200">{log.message}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </Card>

      <TaskFormModal open={editing} onClose={() => setEditing(false)} mode="edit" task={task} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-faint">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="mt-4">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">{label}</p>
      <pre className="tf-terminal tf-scroll overflow-x-auto rounded-lg p-3 text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function AttachmentsCard({ taskId }: { taskId: string }) {
  const { data: attachments } = useAttachments(taskId);
  const upload = useUploadAttachment(taskId);
  const [error, setError] = useState<string | null>(null);

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    upload.mutate(file, {
      onError: () => setError("Upload failed (images and PDF only)"),
    });
    e.target.value = "";
  }

  return (
    <Card className="p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <Paperclip className="h-4 w-4 text-brand" /> Attachments
        </h2>
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
          <Upload className="h-4 w-4" />
          {upload.isPending ? "Uploading…" : "Upload"}
          <input
            type="file"
            className="hidden"
            accept="image/*,application/pdf"
            onChange={onFile}
            disabled={upload.isPending}
          />
        </label>
      </div>
      {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
      {attachments && attachments.length > 0 ? (
        <ul className="divide-y divide-border">
          {attachments.map((a: Attachment) => (
            <li key={a.id} className="flex items-center justify-between py-2 text-sm">
              <span>
                {a.originalFilename}
                <span className="ml-2 text-xs text-faint">{(a.sizeBytes / 1024).toFixed(1)} KB</span>
              </span>
              <button
                onClick={() => saveAttachment(taskId, a.id, a.originalFilename)}
                className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-faint">No attachments.</p>
      )}
    </Card>
  );
}
