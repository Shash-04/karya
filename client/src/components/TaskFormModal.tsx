"use client";

import { FormEvent, useState } from "react";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { getErrorMessage } from "@/lib/errors";
import type { Task, TaskType } from "@/lib/types";
import { Alert } from "./ui/Alert";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Modal } from "./ui/Modal";
import { Spinner } from "./ui/Spinner";

const TYPES: TaskType[] = [
  "EMAIL",
  "REPORT",
  "DATA_EXPORT",
  "IMAGE_PROCESSING",
  "WEBHOOK",
  "GENERIC",
];
const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  task?: Task;
}

export function TaskFormModal({ open, onClose, mode, task }: Props) {
  const create = useCreateTask();
  const update = useUpdateTask();

  const [name, setName] = useState(task?.name ?? "");
  const [type, setType] = useState<TaskType>(task?.type ?? "GENERIC");
  const [priority, setPriority] = useState(task?.priority ?? 0);
  const [description, setDescription] = useState(task?.description ?? "");
  const [payload, setPayload] = useState(
    task?.payload ? JSON.stringify(task.payload, null, 2) : ""
  );
  const [scheduledAt, setScheduledAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submitting = create.isPending || update.isPending;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    let parsedPayload: unknown;
    if (payload.trim()) {
      try {
        parsedPayload = JSON.parse(payload);
      } catch {
        setError("Payload must be valid JSON");
        return;
      }
    }

    try {
      if (mode === "create") {
        await create.mutateAsync({
          name,
          type,
          priority,
          description: description || undefined,
          payload: parsedPayload,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        });
      } else if (task) {
        await update.mutateAsync({
          id: task.id,
          input: { name, priority, description: description || undefined, payload: parsedPayload },
        });
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={mode === "create" ? "New task" : "Edit task"}>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Type</label>
            <select
              className={fieldClass}
              value={type}
              disabled={mode === "edit"}
              onChange={(e) => setType(e.target.value as TaskType)}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Priority</label>
            <Input
              type="number"
              min={0}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            className={fieldClass}
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Payload (JSON)</label>
          <textarea
            className={`${fieldClass} font-mono`}
            rows={3}
            placeholder='{ "fail": true }'
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
          />
        </div>
        {mode === "create" && (
          <div>
            <label className="mb-1 block text-sm font-medium">Schedule for (optional)</label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Spinner className="h-4 w-4 text-white" />}
            {mode === "create" ? "Create task" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
