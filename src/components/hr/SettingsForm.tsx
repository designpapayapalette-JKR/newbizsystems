"use client";
import { useState } from "react";
import { updateHrSettings } from "@/actions/hr_settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save, Clock, AlertCircle } from "lucide-react";

interface SettingsFormProps {
  initialData: any;
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    work_start_time: initialData?.work_start_time || "09:30:00",
    work_end_time: initialData?.work_end_time || "18:30:00",
    half_day_margin_mins: initialData?.half_day_margin_mins || 60,
    team_break_start_time: initialData?.team_break_start_time || "11:00:00",
    team_break_end_time: initialData?.team_break_end_time || "11:15:00",
    lunch_break_start_time: initialData?.lunch_break_start_time || "13:00:00",
    lunch_break_end_time: initialData?.lunch_break_end_time || "14:00:00",
    total_working_hours: initialData?.total_working_hours || 9.00,
    enable_pf_deduction: initialData?.enable_pf_deduction ?? false,
    enable_esi_deduction: initialData?.enable_esi_deduction ?? false,
    enable_tds_deduction: initialData?.enable_tds_deduction ?? false,
    enable_pt_deduction: initialData?.enable_pt_deduction ?? false,
    pf_capping_limit: initialData?.pf_capping_limit || 15000,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateHrSettings(formData);
      toast.success("HR Settings updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update HR settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="work_start_time" className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Start Time</Label>
              <Input type="time" name="work_start_time" value={formData.work_start_time} onChange={handleChange} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="work_end_time" className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> End Time</Label>
              <Input type="time" name="work_end_time" value={formData.work_end_time} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="half_day_margin_mins" className="flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> Late Margin (Minutes)</Label>
            <Input type="number" name="half_day_margin_mins" value={formData.half_day_margin_mins} onChange={handleChange} min={0} required />
            <p className="text-xs text-muted-foreground">If an employee clocks in later than this margin, their attendance is auto-flagged as Half Day.</p>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Breaks (Defaults)</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <Label htmlFor="team_break_start_time">Tea Break Start</Label>
                <Input type="time" name="team_break_start_time" value={formData.team_break_start_time} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="team_break_end_time">Tea Break End</Label>
                <Input type="time" name="team_break_end_time" value={formData.team_break_end_time} onChange={handleChange} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="lunch_break_start_time">Lunch Break Start</Label>
                <Input type="time" name="lunch_break_start_time" value={formData.lunch_break_start_time} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lunch_break_end_time">Lunch Break End</Label>
                <Input type="time" name="lunch_break_end_time" value={formData.lunch_break_end_time} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="total_working_hours">Required Total Working Hours (Per Day)</Label>
              <Input type="number" step="0.5" name="total_working_hours" value={formData.total_working_hours} onChange={handleChange} required />
              <p className="text-xs text-muted-foreground">Used to calculate shortfalls in payroll and attendance.</p>
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Statutory Deductions (Payroll)</h3>
            <div className="space-y-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable PF Deduction</Label>
                  <p className="text-[10px] text-muted-foreground">Automatically deduct 12% Basic Pay for Provident Fund</p>
                </div>
                <Switch checked={formData.enable_pf_deduction} onCheckedChange={(c) => setFormData(p => ({...p, enable_pf_deduction: c}))} />
              </div>
              {formData.enable_pf_deduction && (
                <div className="pl-6 space-y-1.5">
                  <Label htmlFor="pf_capping_limit">PF Capping Limit (Monthly Basic)</Label>
                  <Input type="number" name="pf_capping_limit" value={formData.pf_capping_limit} onChange={handleChange} />
                  <p className="text-[10px] text-muted-foreground italic">Standard limit is ₹15,000. PF will be 12% of Basic or Capping Limit (whichever is lower).</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable ESI Deduction</Label>
                  <p className="text-[10px] text-muted-foreground">Automatically deduct 0.75% Gross Pay for ESI (if Gross &le; ₹21k)</p>
                </div>
                <Switch checked={formData.enable_esi_deduction} onCheckedChange={(c) => setFormData(p => ({...p, enable_esi_deduction: c}))} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable PT Deduction</Label>
                  <p className="text-[10px] text-muted-foreground">Automatically deduct Standard Professional Tax (₹200)</p>
                </div>
                <Switch checked={formData.enable_pt_deduction} onCheckedChange={(c) => setFormData(p => ({...p, enable_pt_deduction: c}))} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable TDS Deduction Engine</Label>
                  <p className="text-[10px] text-muted-foreground">Allow the engine to generate standard TDS deductions</p>
                </div>
                <Switch checked={formData.enable_tds_deduction} onCheckedChange={(c) => setFormData(p => ({...p, enable_tds_deduction: c}))} />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save HR Settings
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}
