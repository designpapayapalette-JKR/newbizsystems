import { redirect } from "next/navigation";

export default function HRPage() {
  // For Phase 1 MVP, redirect directly to the Employee Directory.
  // We can build a true dashboard here in later phases.
  redirect("/CRM/hr/employees");
}
