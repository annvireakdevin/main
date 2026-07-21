"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { deleteProject, reorderProjects, setProjectStatus } from "../actions";

type Row = {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  gridSize: string;
};

function SortableRow({
  row,
  onToggle,
  onDelete,
}: {
  row: Row;
  onToggle: (r: Row) => void;
  onDelete: (r: Row) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-lg border border-line bg-raised px-3 py-2.5 ${
        isDragging ? "z-10 border-pulse shadow-lg" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="cursor-grab text-dim hover:text-fog"
      >
        <GripVertical size={15} />
      </button>

      <Link
        href={`/admin/projects/${row.id}`}
        className="min-w-0 flex-1 truncate text-sm text-snow hover:text-pulse"
      >
        {row.title}
      </Link>

      <span className="sys-tag hidden rounded-sm bg-pulse-soft px-2 py-1 !text-pulse sm:inline">
        {row.category}
      </span>
      <span className="sys-tag hidden w-16 text-right sm:inline">
        {row.gridSize}
      </span>

      <button
        onClick={() => onToggle(row)}
        className={`sys-tag rounded-full border px-3 py-1 transition-colors ${
          row.status === "PUBLISHED"
            ? "border-transparent bg-pulse !text-white"
            : "border-line !text-dim hover:border-line-strong"
        }`}
        title="Toggle draft / published"
      >
        {row.status === "PUBLISHED" ? "Live" : "Draft"}
      </button>

      <button
        onClick={() => onDelete(row)}
        aria-label={`Delete ${row.title}`}
        className="btn btn-danger !border-0 !p-1.5 text-dim"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function ProjectManager({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setRows(initial), [initial]);

  // Keyboard: N → new project
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "n" && !e.metaKey && !e.ctrlKey) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
          router.push("/admin/projects/new");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex((r) => r.id === active.id);
    const newIndex = rows.findIndex((r) => r.id === over.id);
    const next = arrayMove(rows, oldIndex, newIndex);
    setRows(next); // optimistic
    startTransition(async () => {
      const res = await reorderProjects(next.map((r) => r.id));
      if (!res.ok) setError(res.error);
    });
  }

  function onToggle(row: Row) {
    const status = row.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status } : r)));
    startTransition(async () => {
      const res = await setProjectStatus(row.id, status);
      if (!res.ok) setError(res.error);
    });
  }

  function onDelete(row: Row) {
    if (!confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    setRows((rs) => rs.filter((r) => r.id !== row.id));
    startTransition(async () => {
      const res = await deleteProject(row.id);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-snow">Projects</h1>
          <p className="mt-1 text-xs text-dim">
            Drag to reorder the public grid · press{" "}
            <kbd className="rounded border border-line px-1">N</kbd> for new
          </p>
        </div>
        <Link href="/admin/projects/new" className="btn btn-primary">
          <Plus size={14} /> New project
        </Link>
      </div>

      {error && (
        <p className="mb-4 text-xs text-[#e5484d]" role="alert">
          {error}
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={rows.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {rows.map((row) => (
              <SortableRow
                key={row.id}
                row={row}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {rows.length === 0 && (
        <p className="mt-12 text-center text-sm text-dim">
          No projects yet — create one, or run <code>npm run db:seed</code>.
        </p>
      )}
    </div>
  );
}
