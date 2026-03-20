"use client";
import { useState } from "react";
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, TouchSensor, useSensor, useSensors, closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateLeadStage } from "@/actions/leads";
import type { Lead, PipelineStage } from "@/types";
import { formatCurrency, formatRelative, encodeWhatsAppMessage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, Mail, MessageCircle, Calendar, GripVertical, Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createReminder } from "@/actions/reminders";
import { toast } from "sonner";

const PRIORITY_BADGE: Record<string, string> = {
  hot: "🔴",
  warm: "🟡",
  cold: "🔵",
};

function LeadCard({ lead, isDragging, dragHandleProps }: {
  lead: Lead;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}) {
  const priority = (lead as any).priority as string | null | undefined;
  return (
    <div className={`bg-white rounded-lg border shadow-sm space-y-2 ${isDragging ? "opacity-50 rotate-1 shadow-lg" : "hover:shadow-md transition-shadow"}`}>
      {/* Drag handle strip */}
      <div
        {...dragHandleProps}
        className="flex items-center gap-2 px-3 pt-2.5 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-3.5 w-3.5 text-gray-300 shrink-0" />
        <Link
          href={`/CRM/leads/${lead.id}`}
          className="font-medium text-sm hover:text-primary line-clamp-1 flex-1"
          onClick={(e) => e.stopPropagation()}
        >
          {lead.name}
        </Link>
        <div className="flex items-center gap-1 shrink-0">
          {priority && PRIORITY_BADGE[priority] && (
            <span className="text-xs" title={priority}>{PRIORITY_BADGE[priority]}</span>
          )}
          {lead.deal_value && (
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded whitespace-nowrap">
              {formatCurrency(lead.deal_value)}
            </span>
          )}
        </div>
      </div>

      {/* Card body — not draggable, clicks work normally */}
      <div className="px-3 pb-2.5 space-y-1.5">
        {lead.company && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{lead.company}</span>
          </div>
        )}
        {lead.next_followup_at && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{formatRelative(lead.next_followup_at)}</span>
          </div>
        )}
        {lead.tags && lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lead.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] py-0 px-1.5">{tag}</Badge>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1 pt-0.5">
          {lead.phone && (
            <>
              <a
                href={`tel:${lead.phone}`}
                title="Call"
                className="p-1 rounded text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
              </a>
              <a
                href={encodeWhatsAppMessage(lead.phone, `Hi ${lead.name}!`)}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
                className="p-1 rounded text-muted-foreground hover:text-green-600 hover:bg-green-50 transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </a>
            </>
          )}
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              title="Email"
              className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
            </a>
          )}
          <Link
            href={`/CRM/leads/${lead.id}`}
            className="ml-auto text-xs text-primary hover:underline"
          >
            Open →
          </Link>
          <button
            title="Set reminder"
            className="p-1 rounded text-muted-foreground hover:text-amber-600 hover:bg-amber-50 transition-colors"
            onClick={async (e) => {
              e.stopPropagation();
              const due = new Date();
              due.setDate(due.getDate() + 1);
              due.setHours(10, 0, 0, 0);
              try {
                await createReminder({ title: `Follow up — ${lead.name}`, due_at: due.toISOString(), lead_id: lead.id });
                toast.success("Reminder set for tomorrow at 10am");
              } catch {
                toast.error("Failed to set reminder");
              }
            }}
          >
            <Bell className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SortableLeadCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { lead },
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style}>
      <LeadCard lead={lead} isDragging={isDragging} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

function DroppableColumn({ stageId, children }: { stageId: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: stageId });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] space-y-2 rounded-lg p-1 transition-colors ${isOver ? "bg-primary/5 ring-1 ring-primary/20" : ""}`}
    >
      {children}
    </div>
  );
}

interface KanbanBoardProps {
  stages: PipelineStage[];
  leads: Lead[];
}

export function KanbanBoard({ stages, leads }: KanbanBoardProps) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localLeads, setLocalLeads] = useState(leads);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const activeLead = activeId ? localLeads.find((l) => l.id === activeId) : null;

  function getLeadsForStage(stageId: string) {
    return localLeads.filter((l) => l.stage_id === stageId).sort((a, b) => a.position - b.position);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const draggedLead = localLeads.find((l) => l.id === active.id);
    if (!draggedLead) return;

    // over.id could be a stage id (column drop) or a lead id (card drop)
    let targetStageId: string = draggedLead.stage_id ?? "";
    const overLead = localLeads.find((l) => l.id === over.id);
    if (overLead) {
      targetStageId = overLead.stage_id ?? "";
    } else {
      const stage = stages.find((s) => s.id === over.id);
      if (stage) targetStageId = stage.id;
    }

    if (!targetStageId || targetStageId === draggedLead.stage_id) return;

    const stageLeads = localLeads.filter((l) => l.stage_id === targetStageId && l.id !== draggedLead.id);
    const newPosition = overLead ? stageLeads.findIndex((l) => l.id === overLead.id) : stageLeads.length;

    setLocalLeads((prev) =>
      prev.map((l) => l.id === draggedLead.id ? { ...l, stage_id: targetStageId, position: Math.max(0, newPosition) } : l)
    );

    await updateLeadStage(draggedLead.id, targetStageId, Math.max(0, newPosition));
    router.refresh();
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-9rem)] px-4">
        {stages.map((stage) => {
          const stageLeads = getLeadsForStage(stage.id);
          const stageTotal = stageLeads.reduce((sum, l) => sum + (l.deal_value ?? 0), 0);
          return (
            <div key={stage.id} className="flex-shrink-0 w-72">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: stage.color }} />
                <span className="font-medium text-sm">{stage.name}</span>
                <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{stageLeads.length}</span>
                {stageTotal > 0 && (
                  <span className="text-xs text-green-700 font-medium">{formatCurrency(stageTotal)}</span>
                )}
              </div>
              <DroppableColumn stageId={stage.id}>
                <SortableContext items={stageLeads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                  {stageLeads.map((lead) => (
                    <SortableLeadCard key={lead.id} lead={lead} />
                  ))}
                </SortableContext>
              </DroppableColumn>
            </div>
          );
        })}
      </div>
      <DragOverlay>
        {activeLead && <LeadCard lead={activeLead} />}
      </DragOverlay>
    </DndContext>
  );
}
