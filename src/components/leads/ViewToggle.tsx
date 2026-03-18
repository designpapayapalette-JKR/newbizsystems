"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export function ViewToggle({ currentView }: { currentView: "kanban" | "list" }) {
  const router = useRouter();
  const pathname = usePathname();

  function switchView(view: string) {
    router.push(`${pathname}?view=${view}`);
  }

  return (
    <div className="flex items-center border rounded-md overflow-hidden">
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8 rounded-none", currentView === "kanban" && "bg-secondary")}
        onClick={() => switchView("kanban")}
        title="Kanban view"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8 rounded-none", currentView === "list" && "bg-secondary")}
        onClick={() => switchView("list")}
        title="List view"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
