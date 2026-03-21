"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function processClockAction({
  employeeId,
  actionType,
  verifiedTime, // ISO string from internet time api
  location,
  settings
}: {
  employeeId: string;
  actionType: "check_in" | "check_out" | "break_start" | "break_end" | "lunch_start" | "lunch_end";
  verifiedTime: string;
  location: string;
  settings: any;
}) {
  const supabase = await createClient();
  const dateObj = new Date(verifiedTime);
  const dateStr = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
  
  // Format the time as HH:MM:SS from the UTC internet time, adjusted to local or just passed straight if it's the exact moment
  // Assuming the verifiedTime is UTC, we should store it directly as TIME or TIMESTAMPTZ.
  // The DB expects TIME type, let's format it. Wait, if it's UTC, we should format as local time.
  // For simplicity since the app is mainly India, let's offset to IST (+5:30)
  dateObj.setHours(dateObj.getHours() + 5);
  dateObj.setMinutes(dateObj.getMinutes() + 30);
  const timeStr = dateObj.toISOString().split("T")[1].slice(0, 8); // HH:MM:SS in IST

  // Fetch the current attendance record
  const { data: attendance } = await supabase
    .from("hr_attendance")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("date", dateStr)
    .single();

  const updateData: any = {};
  
  if (actionType === "check_in") {
    if (attendance?.check_in_time) throw new Error("Already clocked in today.");
    
    updateData.check_in_time = timeStr;
    updateData.check_in_location = location;
    
    // Check late margin logic
    let status = "present";
    if (settings && settings.work_start_time) {
      const [startH, startM] = settings.work_start_time.split(":");
      const expectedTime = new Date(dateObj);
      expectedTime.setHours(parseInt(startH), parseInt(startM), 0);
      
      const diffMins = (dateObj.getTime() - expectedTime.getTime()) / 60000;
      if (diffMins > (settings.half_day_margin_mins || 60)) {
        status = "half_day";
      }
    }
    updateData.status = status;
    updateData.date = dateStr;
    updateData.employee_id = employeeId;
    
    // organization_id
    const { data: emp } = await supabase.from("hr_employees").select("organization_id").eq("id", employeeId).single();
    if (emp) updateData.organization_id = emp.organization_id;

    if (!attendance) {
      await supabase.from("hr_attendance").insert(updateData);
    } else {
      await supabase.from("hr_attendance").update(updateData).eq("id", attendance.id);
    }
    
  } else if (actionType === "check_out") {
    if (!attendance) throw new Error("No check-in record found to check out from.");
    updateData.check_out_time = timeStr;
    updateData.check_out_location = location;
    
    await supabase.from("hr_attendance").update(updateData).eq("id", attendance.id);
    
  } else if (actionType === "break_start") {
    if (!attendance) throw new Error("Not clocked in.");
    updateData.break_start_time = timeStr;
    await supabase.from("hr_attendance").update(updateData).eq("id", attendance.id);
  } else if (actionType === "break_end") {
    if (!attendance) throw new Error("Not clocked in.");
    updateData.break_end_time = timeStr;
    await supabase.from("hr_attendance").update(updateData).eq("id", attendance.id);
  } else if (actionType === "lunch_start") {
    if (!attendance) throw new Error("Not clocked in.");
    updateData.lunch_start_time = timeStr;
    await supabase.from("hr_attendance").update(updateData).eq("id", attendance.id);
  } else if (actionType === "lunch_end") {
    if (!attendance) throw new Error("Not clocked in.");
    updateData.lunch_end_time = timeStr;
    await supabase.from("hr_attendance").update(updateData).eq("id", attendance.id);
  }

  revalidatePath("/ERP/hr");
  revalidatePath("/ERP/hr/time-clock");
}
