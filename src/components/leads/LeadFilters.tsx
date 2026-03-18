"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import type { PipelineStage } from "@/types";

const SOURCES = ["website","referral","social_media","cold_call","email","event","other"];
const PRIORITIES = ["hot","warm","cold"];
const SORTS = [
  { value: "position", label: "Default" },
  { value: "created_at", label: "Newest" },
  { value: "deal_value", label: "Deal Value" },
  { value: "name", label: "Name" },
  { value: "followup", label: "Follow-up Date" },
];

interface LeadFiltersProps {
  stages: PipelineStage[];
}

export function LeadFilters({ stages }: LeadFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // reset pagination
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  }

  function clearAll() {
    const params = new URLSearchParams();
    const view = searchParams.get("view");
    if (view) params.set("view", view);
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  }

  const hasFilters = ["search","stage_id","source","priority","sort"].some(k => searchParams.has(k) && searchParams.get(k) !== "position");

  return (
    <div className={`flex flex-wrap gap-2 px-4 py-2 ${isPending ? "opacity-60" : ""}`}>
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search leads..."
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            clearTimeout((window as any).__searchTimer);
            (window as any).__searchTimer = setTimeout(() => updateParam("search", val), 400);
          }}
          className="pl-8 h-9"
        />
      </div>
      {/* Stage filter */}
      <Select value={searchParams.get("stage_id") ?? "all"} onValueChange={(v) => updateParam("stage_id", v)}>
        <SelectTrigger className="h-9 w-36"><SelectValue placeholder="All Stages" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>
          {stages.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
        </SelectContent>
      </Select>
      {/* Priority filter */}
      <Select value={searchParams.get("priority") ?? "all"} onValueChange={(v) => updateParam("priority", v)}>
        <SelectTrigger className="h-9 w-32"><SelectValue placeholder="Priority" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          {PRIORITIES.map((p) => <SelectItem key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase()+p.slice(1)}</SelectItem>)}
        </SelectContent>
      </Select>
      {/* Source filter */}
      <Select value={searchParams.get("source") ?? "all"} onValueChange={(v) => updateParam("source", v)}>
        <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Source" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          {SOURCES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g," ")}</SelectItem>)}
        </SelectContent>
      </Select>
      {/* Sort */}
      <Select value={searchParams.get("sort") ?? "position"} onValueChange={(v) => updateParam("sort", v)}>
        <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
        <SelectContent>
          {SORTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
        </SelectContent>
      </Select>
      {/* Clear */}
      {hasFilters && (
        <Button variant="ghost" size="sm" className="h-9 gap-1" onClick={clearAll}>
          <X className="h-3.5 w-3.5" /> Clear
        </Button>
      )}
    </div>
  );
}
