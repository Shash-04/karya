"use client";

import { FormEvent, useState } from "react";
import { Braces, Calendar, Plus } from "lucide-react";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { getErrorMessage } from "@/lib/errors";
import { TASK_TYPES, taskTypeMeta } from "@/lib/labels";
import type { Task, TaskType } from "@/lib/types";
import { Alert } from "./ui/Alert";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Modal } from "./ui/Modal";
import { Spinner } from "./ui/Spinner";

const fieldClass =
  "w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/25";

const PRIORITIES = [
  { value: 1, label: "P1 - Normal Priority" },
  { value: 2, label: "P2 - Elevated" },
  { value: 3, label: "P3 - High" },
  { value: 4, label: "P4 - Critical" },
];

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
  const [type, setType] = useState<TaskType>(task?.type ?? "IMAGE_PROCESSING");
  const [priority, setPriority] = useState(task?.priority || 1);
  const [description, setDescription] = useState(task?.description ?? "");
  const [payload, setPayload] = useState(
    task?.payload ? JSON.stringify(task.payload, null, 2) : '{\n  "source": "api_upload"\n}'
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
    <Modal
      open={open}
      onClose={onClose}
      icon={<Plus className="h-5 w-5" />}
      title={mode === "create" ? "Create Asynchronous Task" : "Edit Task"}
      subtitle={mode === "create" ? "Queue a job for background worker processing" : undefined}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}

        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            Task Title <span className="text-brand">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Process Customer Invoice Batch #992"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-muted">
            Description (Optional)
          </label>
          <textarea
            className={fieldClass}
            rows={2}
            placeholder="Provide context or operational instructions…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Task Type</label>
            <select
              className={fieldClass}
              value={type}
              disabled={mode === "edit"}
              onChange={(e) => setType(e.target.value as TaskType)}
            >
              {TASK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {taskTypeMeta(t).label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Priority</label>
            <select
              className={fieldClass}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {mode === "create" && (
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-muted">
              <Calendar className="h-3.5 w-3.5" /> Schedule Execution (Optional)
            </label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
            <p className="mt-1 text-xs text-faint">
              Leave blank to queue for immediate worker execution.
            </p>
          </div>
        )}

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-muted">
            <Braces className="h-3.5 w-3.5" /> Payload JSON (Optional)
          </label>
          <textarea
            className={`${fieldClass} font-mono text-xs`}
            rows={4}
            placeholder='{ "key": "value" }'
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Spinner className="h-4 w-4 text-white" />}
            {mode === "create" ? "Dispatch Task" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
