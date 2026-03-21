"use client";
import { useState } from "react";
import { addHrHoliday, toggleHrHoliday, deleteHrHoliday } from "@/actions/hr_settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CalendarPlus, Trash2, CheckCircle2, XCircle } from "lucide-react";
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
                <div key={h.id} className={`flex items-center justify-between p-3 text-sm ${!h.is_active && 'opacity-60 bg-gray-50'}`}>
                  <div className="flex flex-col">
                    <span className="font-medium flex items-center gap-2">
                      {h.name}
                      {h.is_active ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                    </span>
                    <span className="text-muted-foreground text-xs">{formatDate(h.date)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={h.is_active} 
                      onCheckedChange={() => handleToggle(h.id, h.is_active)} 
                      disabled={loading || adding}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(h.id)}
                      disabled={loading || adding}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
