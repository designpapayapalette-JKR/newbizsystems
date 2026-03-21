"use client";
import { useState } from "react";
import { addHrHoliday, toggleHrHoliday, deleteHrHoliday } from "@/actions/hr_settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CalendarPlus, Trash2, CheckCircle2, XCircle, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Holiday {
  id: string;
  name: string;
  date: string;
  is_active: boolean;
  type: string;
}

interface HolidaysListProps {
  initialHolidays: Holiday[];
}

export function HolidaysList({ initialHolidays }: HolidaysListProps) {
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [holidays, setHolidays] = useState(initialHolidays);
  const [formData, setFormData] = useState({ name: "", date: "" });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date) return;
    setAdding(true);
    try {
      await addHrHoliday({ ...formData, type: "company", is_active: true });
      toast.success("Holiday added");
      setFormData({ name: "", date: "" });
      // In a real app we'd refresh the page or rely on server actions revalidating,
      // but we optimistically update the UI here too if needed, or just let Server Action refresh.
      // Since it's a server action with revalidatePath, the page will reload.
    } catch (error: any) {
      toast.error(error.message || "Failed to add holiday");
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      await toggleHrHoliday(id, !currentStatus);
      toast.success(currentStatus ? "Holiday disabled" : "Holiday enabled");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this holiday?")) return;
    setLoading(true);
    try {
      await deleteHrHoliday(id);
      toast.success("Holiday removed");
    } catch {
      toast.error("Failed to delete holiday");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleAddSubmit} className="flex gap-3 items-end">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="name">Holiday Name</Label>
              <Input placeholder="e.g. Diwali" name="name" value={formData.name} onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="date">Date</Label>
              <Input type="date" name="date" value={formData.date} onChange={(e) => setFormData(f => ({ ...f, date: e.target.value }))} required />
            </div>
            <Button type="submit" disabled={adding}>
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Upcoming Holidays</CardTitle>
          <CardDescription>Toggle holidays to include or exclude them from attendance tracking.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {initialHolidays.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No holidays configured.
            </div>
          ) : (
            <div className="divide-y border rounded-md">
              {initialHolidays.map((h) => (
                <HolidayRow key={h.id} holiday={h} loading={loading || adding} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HolidayRow({ holiday: h, loading: globalLoading }: { holiday: Holiday, loading: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: h.name, date: h.date });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { updateHrHoliday } = await import("@/actions/hr_settings");
      await updateHrHoliday(h.id, formData);
      toast.success("Holiday updated");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update holiday");
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleUpdate} className="flex gap-2 items-center p-2 bg-blue-50/50 border-b last:border-0 animate-in fade-in slide-in-from-top-1">
        <Input size={32} className="h-8 py-1 text-sm flex-1" value={formData.name} onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))} autoFocus />
        <Input type="date" className="h-8 py-1 text-sm w-36" value={formData.date} onChange={(e) => setFormData(f => ({ ...f, date: e.target.value }))} />
        <Button type="submit" size="sm" disabled={loading} className="h-8 px-2">Save</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={loading} className="h-8 px-2">Cancel</Button>
      </form>
    );
  }

  return (
    <div key={h.id} className={`flex items-center justify-between p-3 text-sm border-b last:border-0 ${!h.is_active && 'opacity-60 bg-gray-50'}`}>
      <div className="flex flex-col">
        <span className="font-medium flex items-center gap-2">
          {h.name}
          {h.is_active ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}
        </span>
        <span className="text-muted-foreground text-xs">{formatDate(h.date)}</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch 
          checked={h.is_active} 
          onCheckedChange={async () => {
             const { toggleHrHoliday } = await import("@/actions/hr_settings");
             try { await toggleHrHoliday(h.id, !h.is_active); toast.success("Status updated"); }
             catch { toast.error("Update failed"); }
          }} 
          disabled={globalLoading || loading}
        />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setIsEditing(true)} disabled={globalLoading || loading}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={async () => {
             if (!confirm("Remove holiday?")) return;
             const { deleteHrHoliday } = await import("@/actions/hr_settings");
             try { await deleteHrHoliday(h.id); toast.success("Holiday removed"); }
             catch { toast.error("Delete failed"); }
          }}
          disabled={globalLoading || loading}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
