"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors, closestCenter,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { updatePipelineStages } from "@/actions/organizations";
import { toast } from "sonner";
import { GripVertical, Plus, Trash2, Loader2, Trophy, XCircle } from "lucide-react";
import type { PipelineStage } from "@/types";

const COLORS = ["#6366f1","#f59e0b","#3b82f6","#8b5cf6","#f97316","#22c55e","#ef4444","#ec4899","#06b6d4","#14b8a6"];

interface EditableStage {
  id?: string;
  name: string;
  color: string;
  position: number;
  is_won: boolean;
  is_lost: boolean;
}

function SortableStageRow({
  stage, index, onChange, onRemove,
}: {
  stage: EditableStage;
  index: number;
  onChange: (i: number, field: keyof EditableStage, val: any) => void;
  onRemove: (i: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: String(index) });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 bg-white rounded-lg border p-2">
      <button {...attributes} {...listeners} className="text-muted-foreground cursor-grab">
        <GripVertical className="h-4 w-4" />
      </button>
      <input
        type="color"
        value={stage.color}
        onChange={(e) => onChange(index, "color", e.target.value)}
        className="h-8 w-8 rounded cursor-pointer border-0"
        title="Stage color"
      />
      <Input
        value={stage.name}
        onChange={(e) => onChange(index, "name", e.target.value)}
        placeholder="Stage name"
        className="flex-1 h-8"
        required
      />
      <button
        type="button"
        onClick={() => onChange(index, "is_won", !stage.is_won)}
        title="Mark as Won stage"
        className={`p-1 rounded transition-colors ${stage.is_won ? "text-green-600" : "text-muted-foreground hover:text-green-600"}`}
      >
        <Trophy className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange(index, "is_lost", !stage.is_lost)}
        title="Mark as Lost stage"
        className={`p-1 rounded transition-colors ${stage.is_lost ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
      >
        <XCircle className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="text-muted-foreground hover:text-destructive p-1 rounded"
        title="Remove stage"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function PipelineStagesEditor({ stages: initial, orgId }: { stages: PipelineStage[]; orgId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState<EditableStage[]>(
    initial.map((s) => ({ id: s.id, name: s.name, color: s.color, position: s.position, is_won: s.is_won, is_lost: s.is_lost }))
  );

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = parseInt(active.id as string);
      const newIndex = parseInt(over!.id as string);
      setStages((prev) => arrayMove(prev, oldIndex, newIndex).map((s, i) => ({ ...s, position: i })));
    }
  }

  function handleChange(index: number, field: keyof EditableStage, val: any) {
    setStages((prev) => prev.map((s, i) => i === index ? { ...s, [field]: val } : s));
  }

  function addStage() {
    setStages((prev) => [...prev, {
      name: "",
      color: COLORS[prev.length % COLORS.length],
      position: prev.length,
      is_won: false,
      is_lost: false,
    }]);
  }

  function removeStage(index: number) {
    setStages((prev) => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, position: i })));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (stages.some((s) => !s.name.trim())) {
      toast.error("All stages must have a name");
      return;
    }
    setLoading(true);
    try {
      await updatePipelineStages(orgId, stages);
      toast.success("Pipeline stages saved");
      router.refresh();
    } catch {
      toast.error("Failed to save stages");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <p className="text-xs text-muted-foreground flex items-center gap-3">
        <Trophy className="h-3.5 w-3.5 text-green-600" /> Won &nbsp;
        <XCircle className="h-3.5 w-3.5 text-red-500" /> Lost
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stages.map((_, i) => String(i))} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {stages.map((stage, i) => (
              <SortableStageRow key={i} stage={stage} index={i} onChange={handleChange} onRemove={removeStage} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button type="button" variant="outline" className="w-full gap-1" onClick={addStage}>
        <Plus className="h-4 w-4" /> Add Stage
      </Button>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="animate-spin" />}
        Save Pipeline
      </Button>
    </form>
  );
}
