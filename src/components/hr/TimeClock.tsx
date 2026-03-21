"use client";
import { useState, useEffect } from "react";
import { processClockAction } from "@/actions/hr_attendance_clock";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, MapPin, Clock, Coffee, LogIn, LogOut, CheckCircle2 } from "lucide-react";

interface TimeClockProps {
  employee: { id: string; first_name: string; last_name: string };
  todaysAttendance: any;
  settings: any;
  holidays: any[];
}

export function TimeClock({ employee, todaysAttendance, settings, holidays }: TimeClockProps) {
  const [loading, setLoading] = useState(false);
  const [actionLabel, setActionLabel] = useState("");
  const [localTime, setLocalTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setLocalTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = async (actionType: "check_in" | "check_out" | "break_start" | "break_end" | "lunch_start" | "lunch_end") => {
    setActionLabel(actionType);
    setLoading(true);
    try {
      // 1. Get exact internet time
      const timeResp = await fetch("https://worldtimeapi.org/api/timezone/Etc/UTC");
      if (!timeResp.ok) throw new Error("Could not verify internet time");
      const timeData = await timeResp.json();
      const verifiedIsoTime = timeData.utc_datetime;

      // 2. Get exact location
      const getPosition = () => new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) reject(new Error("Geolocation not supported by browser."));
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 });
      });

      let locationStr = "Unknown";
      try {
        const pos = await getPosition();
        locationStr = `${pos.coords.latitude},${pos.coords.longitude} (Acc: ${Math.round(pos.coords.accuracy)}m)`;
      } catch (err: any) {
        throw new Error("Location access is strictly required to clock in. Please allow location access in your browser.");
      }

      // 3. Process action on server
      await processClockAction({
        employeeId: employee.id,
        actionType,
        verifiedTime: verifiedIsoTime,
        location: locationStr,
        settings
      });

      toast.success("Time recorded successfully");
      
    } catch (error: any) {
      toast.error(error.message || "Failed to process time clock");
    } finally {
      setLoading(false);
    }
  };

  const a = todaysAttendance;
  const isCheckedIn = !!a?.check_in_time;
  const isCheckedOut = !!a?.check_out_time;
  const isOnBreak = !!a?.break_start_time && !a?.break_end_time;
  const isOnLunch = !!a?.lunch_start_time && !a?.lunch_end_time;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <div className="md:col-span-2 space-y-6">
        <Card className="border-t-4 border-t-primary">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-4xl font-mono tracking-tight tabular-nums">
              {localTime.toLocaleTimeString('en-US', { hour12: false })}
            </CardTitle>
            <CardDescription className="text-lg">
              {localTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {!isCheckedIn ? (
               <Button 
                onClick={() => handleAction("check_in")} 
                disabled={loading} 
                className="w-full h-16 text-lg bg-green-600 hover:bg-green-700"
              >
                {loading && actionLabel === "check_in" ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <LogIn className="h-6 w-6 mr-2" />}
                Clock In
              </Button>
            ) : !isCheckedOut ? (
              <div className="grid grid-cols-2 gap-4">
                {isOnBreak ? (
                   <Button onClick={() => handleAction("break_end")} disabled={loading} variant="outline" className="h-14">
                     {loading && actionLabel === "break_end" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Coffee className="h-4 w-4 mr-2" />} End Tea Break
                   </Button>
                ) : (
                   <Button onClick={() => handleAction("break_start")} disabled={loading || isOnLunch} variant="secondary" className="h-14">
                     <Coffee className="h-4 w-4 mr-2" /> Start Tea Break
                   </Button>
                )}

                {isOnLunch ? (
                   <Button onClick={() => handleAction("lunch_end")} disabled={loading} variant="outline" className="h-14 bg-amber-50">
                     {loading && actionLabel === "lunch_end" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Coffee className="h-4 w-4 mr-2" />} End Lunch
                   </Button>
                ) : (
                   <Button onClick={() => handleAction("lunch_start")} disabled={loading || isOnBreak} variant="secondary" className="h-14 bg-amber-100/50 hover:bg-amber-100">
                     <Coffee className="h-4 w-4 mr-2" /> Start Lunch
                   </Button>
                )}
                
                <Button 
                  onClick={() => handleAction("check_out")} 
                  disabled={loading || isOnBreak || isOnLunch} 
                  className="col-span-2 h-16 text-lg" 
                  variant="destructive"
                >
                  {loading && actionLabel === "check_out" ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <LogOut className="h-6 w-6 mr-2" />}
                  Clock Out
                </Button>
              </div>
            ) : (
               <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-6 text-center space-y-2">
                 <CheckCircle2 className="h-8 w-8 mx-auto text-green-600" />
                 <h3 className="font-semibold text-lg">Shift Completed</h3>
                 <p className="text-sm">You have successfully clocked out for the day.</p>
               </div>
            )}

            <div className="bg-blue-50/50 border rounded-lg p-4 text-xs text-muted-foreground flex gap-3">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
              <p>Your exact location and verified internet time will be recorded when you interact with this terminal to prevent device time spoofing.</p>
            </div>
          </CardContent>
        </Card>

        {a && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Today's Log</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm divide-x border rounded-lg p-4 bg-gray-50/50">
                <div className="px-2">
                  <p className="text-xs text-muted-foreground mb-1">Clock In</p>
                  <p className="font-medium">{a.check_in_time || '--:--'}</p>
                </div>
                <div className="px-2">
                  <p className="text-xs text-muted-foreground mb-1">Breaks</p>
                  <p className="font-medium">{(a.break_start_time || a.lunch_start_time) ? 'Started' : 'None'}</p>
                </div>
                <div className="px-2">
                  <p className="text-xs text-muted-foreground mb-1">Clock Out</p>
                  <p className="font-medium">{a.check_out_time || '--:--'}</p>
                </div>
                <div className="px-2">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="font-medium uppercase text-[10px] tracking-wider bg-white border inline-flex px-1.5 py-0.5 rounded">{a.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <Card>
           <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground"/> Required Hours</CardTitle></CardHeader>
           <CardContent className="space-y-4">
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Standard</span>
               <span className="font-medium">{settings?.total_working_hours || "9.00"} Hrs</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Office Timing</span>
               <span className="font-medium">{settings?.work_start_time?.slice(0,5)} - {settings?.work_end_time?.slice(0,5)}</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Late Margin</span>
               <span className="font-medium">{settings?.half_day_margin_mins || 60} mins</span>
             </div>
           </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Upcoming Holidays</CardTitle></CardHeader>
          <CardContent>
            {holidays.length === 0 ? (
              <p className="text-xs text-muted-foreground">No upcoming holidays scheduled.</p>
            ) : (
              <div className="space-y-3">
                {holidays.filter(h => h.is_active).map(h => (
                  <div key={h.id} className="flex justify-between text-sm">
                    <span className="font-medium truncate pr-2">{h.name}</span>
                    <span className="text-muted-foreground shrink-0">{new Date(h.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
