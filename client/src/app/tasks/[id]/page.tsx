"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { StatusBadge } from "@/components/StatusBadge";
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboard" className="text-sm text-slate-500 hover:underline">
            ← Back to dashboard
          </Link>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold">{task.name}</h1>
            <StatusBadge status={task.status} />
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
              {retry.isPending && <Spinner className="h-4 w-4 text-white" />}
              Retry
            </Button>
          )}
          <Button variant="danger" onClick={onDelete} disabled={del.isPending}>
            Delete
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <ProgressBar value={task.progress} status={task.status} />
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Field label="Type" value={task.type} />
          <Field label="Priority" value={String(task.priority)} />
          <Field label="Attempts" value={String(task.attempts)} />
          <Field label="Scheduled" value={formatDateTime(task.scheduledAt)} />
          <Field label="Created" value={formatDateTime(task.createdAt)} />
          <Field label="Updated" value={formatDateTime(task.updatedAt)} />
        </dl>
        {task.errorMessage && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {task.errorMessage}
          </p>
        )}
        {task.payload != null && <JsonBlock label="Payload" value={task.payload} />}
        {task.result != null && <JsonBlock label="Result" value={task.result} />}
      </Card>

      <AttachmentsCard taskId={task.id} />

      <Card className="p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Execution log
        </h2>
        <ol className="space-y-2">
          {logs.map((log) => (
            <li key={log.id} className="flex gap-3 text-sm">
              <span className="w-32 shrink-0 text-slate-400">{formatDateTime(log.createdAt)}</span>
              <span
                className={`w-14 shrink-0 font-mono text-xs ${
                  log.level === "ERROR"
                    ? "text-red-500"
                    : log.level === "WARN"
                      ? "text-amber-500"
                      : "text-slate-400"
                }`}
              >
                {log.level}
              </span>
              <span>{log.message}</span>
            </li>
          ))}
        </ol>
      </Card>

      <TaskFormModal open={editing} onClose={() => setEditing(false)} mode="edit" task={task} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="mt-4">
      <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <pre className="overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-950">
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
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Attachments</h2>
        <label className="cursor-pointer text-sm font-medium text-indigo-600 hover:underline">
          {upload.isPending ? "Uploading…" : "+ Upload"}
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
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {attachments.map((a: Attachment) => (
            <li key={a.id} className="flex items-center justify-between py-2 text-sm">
              <span>
                {a.originalFilename}
                <span className="ml-2 text-xs text-slate-400">
                  {(a.sizeBytes / 1024).toFixed(1)} KB
                </span>
              </span>
              <button
                onClick={() => saveAttachment(taskId, a.id, a.originalFilename)}
                className="font-medium text-indigo-600 hover:underline"
              >
                Download
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400">No attachments.</p>
      )}
    </Card>
  );
}
