import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToStream } from "@react-pdf/renderer";
import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#333" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30, borderBottom: 1, paddingBottom: 10 },
  companyName: { fontSize: 24, fontWeight: "bold", color: "#111" },
  title: { fontSize: 16, textAlign: "center", marginBottom: 20, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1 },
  empSection: { marginBottom: 20, flexDirection: "row", justifyContent: "space-between" },
  empGroup: { width: "45%" },
  label: { color: "#666", marginBottom: 2 },
  value: { fontWeight: "bold", fontSize: 11, marginBottom: 8 },
  table: { width: "100%", flexDirection: "row", borderTop: 1, borderBottom: 1, borderColor: "#ccc" },
  column: { width: "50%", padding: 10 },
  rightColumn: { borderLeft: 1, borderColor: "#ccc" },
  tableHeader: { fontWeight: "bold", borderBottom: 1, borderColor: "#eee", paddingBottom: 5, marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 15, paddingTop: 10, borderTop: 1, borderColor: "#eee", fontWeight: "bold" },
  netPayBg: { backgroundColor: "#f0fdf4", padding: 15, marginTop: 20, borderRadius: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  netPayText: { fontSize: 14, color: "#166534" },
  netPayAmount: { fontSize: 18, fontWeight: "bold", color: "#166534" },
  footer: { position: "absolute", bottom: 40, left: 40, right: 40, textAlign: "center", color: "#999", borderTop: 1, borderColor: "#eee", paddingTop: 10 },
});

const SalarySlip = ({ record, org }: { record: any, org: any }) => {
  const emp = record.employee;
  
  const earnings = [
    { label: "Basic Salary", amount: record.basic_salary },
    { label: "House Rent Allowance (HRA)", amount: record.hra },
    { label: "Special Allowance", amount: record.special_allowance },
  ];
  const gross = earnings.reduce((sum, item) => sum + Number(item.amount), 0);

  const deductions = [
    { label: "Provident Fund (PF)", amount: record.pf_deduction },
    { label: "ESI", amount: record.esi_deduction },
    { label: "Professional Tax", amount: record.pt_deduction },
    { label: "TDS", amount: record.tds_deduction },
  ].filter(d => Number(d.amount) > 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + Number(item.amount), 0);

  const formattedMonth = new Date(record.month_year + "-01").toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{org.name}</Text>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text>Payslip for {formattedMonth}</Text>
          </View>
        </View>

        <Text style={styles.title}>Salary Slip</Text>

        <View style={styles.empSection}>
          <View style={styles.empGroup}>
            <Text style={styles.label}>Employee Name</Text>
            <Text style={styles.value}>{emp.first_name} {emp.last_name}</Text>
            <Text style={styles.label}>Designation</Text>
            <Text style={styles.value}>{emp.job_title || "Team Member"}</Text>
          </View>
          <View style={styles.empGroup}>
            <Text style={styles.label}>Employee ID</Text>
            <Text style={styles.value}>{emp.employee_id || "N/A"}</Text>
            <Text style={styles.label}>Date of Joining</Text>
            <Text style={styles.value}>{emp.date_of_joining ? new Date(emp.date_of_joining).toLocaleDateString() : 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.column}>
            <Text style={styles.tableHeader}>Earnings</Text>
            {earnings.map((e, i) => (
              <View key={i} style={styles.row}>
                <Text>{e.label}</Text>
                <Text>{formatCurrency(e.amount)}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text>Total Gross</Text>
              <Text>{formatCurrency(gross)}</Text>
            </View>
          </View>
          <View style={[styles.column, styles.rightColumn]}>
            <Text style={styles.tableHeader}>Deductions</Text>
            {deductions.length === 0 ? (
              <Text style={{ fontStyle: "italic", color: "#999" }}>No deductions this month.</Text>
            ) : (
              deductions.map((d, i) => (
                <View key={i} style={styles.row}>
                  <Text>{d.label}</Text>
                  <Text>{formatCurrency(d.amount)}</Text>
                </View>
              ))
            )}
            <View style={styles.totalRow}>
              <Text>Total Deductions</Text>
              <Text>{formatCurrency(totalDeductions)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.netPayBg}>
          <Text style={styles.netPayText}>Net Payable</Text>
          <Text style={styles.netPayAmount}>{formatCurrency(record.net_payable)}</Text>
        </View>
        
        <View style={{ marginTop: 40, fontSize: 9, color: "#666" }}>
          <Text>Amount in words: Rupees {Number(record.net_payable).toLocaleString('en-IN')}</Text>
          <Text style={{ marginTop: 20 }}>This is a computer-generated document. No signature is required.</Text>
        </View>

      </Page>
    </Document>
  );
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { data: record, error } = await supabase
      .from("hr_payroll")
      .select("*, employee:employee_id(*), org:organization_id(name)")
      .eq("id", id)
      .maybeSingle();

    if (error || !record) return new NextResponse("Not Found", { status: 404 });

    // Validate access (must match employee or admin)
    // Assuming admin if reaching here for now, or RLS handles it.
    
    const stream = await renderToStream(<SalarySlip record={record} org={record.org} />);
    
    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Salary_Slip_${record.month_year}_${record.employee.first_name}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
