"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { createLead } from "@/actions/leads";
import { toast } from "sonner";
import { Upload, Loader2, FileText, Download, FileSpreadsheet } from "lucide-react";
import type { PipelineStage } from "@/types";
import * as XLSX from "xlsx";

// Column definitions — single source of truth for template + parser
const COLUMNS = [
  { key: "name",        label: "Name *",        hint: "Full name of lead (required)" },
  { key: "email",       label: "Email",          hint: "Email address" },
  { key: "phone",       label: "Phone",          hint: "Phone number with country code, e.g. +919876543210" },
  { key: "company",     label: "Company",        hint: "Company / organisation name" },
  { key: "source",      label: "Source",         hint: "Website | Referral | Social Media | Cold Call | WhatsApp | Event | Other" },
  { key: "deal_value",  label: "Deal Value",     hint: "Numeric value only, e.g. 50000" },
  { key: "stage",       label: "Stage",          hint: "Must match an existing pipeline stage name exactly" },
  { key: "priority",    label: "Priority",       hint: "hot | warm | cold" },
  { key: "notes",       label: "Notes",          hint: "Any additional notes" },
  { key: "gstin",       label: "GSTIN",          hint: "GST Identification Number (optional)" },
  { key: "pan",         label: "PAN",            hint: "Permanent Account Number (optional)" },
  { key: "state",       label: "State",          hint: "State name for GST billing (optional)" },
  { key: "tags",        label: "Tags",           hint: "Comma-separated tags, e.g. vip,enterprise" },
];

function downloadTemplate(stages: PipelineStage[]) {
  const wb = XLSX.utils.book_new();

  // --- Leads sheet ---
  const headers = COLUMNS.map(c => c.label);
  const hints   = COLUMNS.map(c => c.hint);
  const sample  = [
    "Ravi Kumar", "ravi@example.com", "+919876543210", "Acme Corp",
    "Referral", "75000", stages[0]?.name ?? "New Lead", "warm",
    "Met at conference", "22AAAAA0000A1Z5", "AAAAA0000A", "Maharashtra", "vip,conference",
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, hints, sample]);

  // Style header row — set column widths
  ws["!cols"] = COLUMNS.map(() => ({ wch: 22 }));

  // Freeze top row
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };

  XLSX.utils.book_append_sheet(wb, ws, "Leads");

  // --- Stages reference sheet ---
  const stageData = [
    ["Stage Name", "Description"],
    ...stages.map(s => [s.name, s.is_won ? "Won stage" : s.is_lost ? "Lost stage" : "Active stage"]),
  ];
  const wsStages = XLSX.utils.aoa_to_sheet(stageData);
  wsStages["!cols"] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsStages, "Pipeline Stages");

  // --- Instructions sheet ---
  const instructions = [
    ["NewBiz CRM — Lead Import Template Instructions"],
    [""],
    ["Sheet: Leads"],
    ["  Row 1: Column headers (do not modify)"],
    ["  Row 2: Hints / allowed values (you may delete this row before uploading)"],
    ["  Row 3+: Your lead data"],
    [""],
    ["Required fields: Name"],
    ["Optional fields: all others"],
    [""],
    ["Tips:"],
    ["  • Stage must match a name from the 'Pipeline Stages' sheet exactly"],
    ["  • Priority must be: hot, warm, or cold (lowercase)"],
    ["  • Deal Value must be a number (no currency symbols)"],
    ["  • Tags: separate multiple tags with a comma, e.g. vip,enterprise"],
    ["  • Delete Row 2 (hints row) before uploading if it causes import errors"],
    [""],
    ["Supported upload formats: .xlsx, .xls, .csv"],
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(instructions);
  wsInfo["!cols"] = [{ wch: 65 }];
  XLSX.utils.book_append_sheet(wb, wsInfo, "Instructions");

  XLSX.writeFile(wb, "leads_import_template.xlsx");
}

function parseWorkbook(buffer: ArrayBuffer): Record<string, string>[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as string[][];
  if (raw.length < 2) return [];

  // Find the header row — skip rows that look like hint rows
  // Header row: contains at least "Name *" or "name" (case-insensitive)
  let headerIdx = 0;
  for (let i = 0; i < Math.min(raw.length, 5); i++) {
    const row = raw[i].map(v => String(v).toLowerCase().trim());
    if (row.some(v => v === "name *" || v === "name")) { headerIdx = i; break; }
  }

  // Normalise headers: strip " *", lowercase
  const headers = raw[headerIdx].map(h =>
    String(h).toLowerCase().replace(/\s*\*\s*$/, "").trim()
  );

  const dataRows = raw.slice(headerIdx + 1).filter(r =>
    r.some(v => String(v).trim() !== "")
  );

  // Skip the hints row (row right after header) if it looks like hints
  const firstRow = dataRows[0];
  const isHintRow = firstRow && headers.some((h, i) => {
    const val = String(firstRow[i] ?? "").toLowerCase();
    return val.includes("full name") || val.includes("email address") || val.includes("numeric value");
  });

  const rows = isHintRow ? dataRows.slice(1) : dataRows;

  return rows.map(row =>
    Object.fromEntries(headers.map((h, i) => [h, String(row[i] ?? "").trim()]))
  );
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h =>
    h.replace(/^"|"$/g, "").trim().toLowerCase().replace(/\s*\*\s*$/, "")
  );
  const dataLines = lines.slice(1);

  // Skip hint row
  const isHintRow = dataLines[0] && (() => {
    const vals = dataLines[0].split(",").map(v => v.replace(/^"|"$/g, "").toLowerCase());
    return vals.some(v => v.includes("full name") || v.includes("email address") || v.includes("numeric value"));
  })();

  return (isHintRow ? dataLines.slice(1) : dataLines).map(line => {
    const vals: string[] = [];
    let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { vals.push(cur); cur = ""; }
      else cur += ch;
    }
    vals.push(cur);
    return Object.fromEntries(headers.map((h, i) => [h, (vals[i] ?? "").replace(/^"|"$/g, "").trim()]));
  });
}

interface LeadCsvImportProps {
  stages: PipelineStage[];
}

export function LeadCsvImport({ stages }: LeadCsvImportProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setRows([]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const parsed = parseWorkbook(ev.target?.result as ArrayBuffer);
        setRows(parsed);
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const parsed = parseCsv(ev.target?.result as string);
        setRows(parsed);
      };
      reader.readAsText(file);
    }
  }

  async function handleImport() {
    if (!rows.length) return;
    setLoading(true);
    let success = 0, fail = 0;
    for (const row of rows) {
      try {
        const stageName = row["stage"] ?? "";
        const stageMatch = stages.find(s => s.name.toLowerCase() === stageName.toLowerCase());
        const priority = (row["priority"] ?? "").toLowerCase();
        await createLead({
          name: row["name"] || "Unknown",
          email:      row["email"]      || undefined,
          phone:      row["phone"]      || undefined,
          company:    row["company"]    || undefined,
          source:     row["source"]     || undefined,
          deal_value: row["deal value"] || row["deal_value"]
            ? parseFloat(row["deal value"] ?? row["deal_value"])
            : undefined,
          stage_id:   stageMatch?.id,
          priority:   (priority === "hot" || priority === "warm" || priority === "cold") ? priority : undefined,
          notes:      row["notes"]      || undefined,
          gstin:      row["gstin"]      || undefined,
          pan:        row["pan"]        || undefined,
          state:      row["state"]      || undefined,
          tags: row["tags"] ? row["tags"].split(",").map(t => t.trim()).filter(Boolean) : undefined,
        });
        success++;
      } catch { fail++; }
    }
    setLoading(false);
    toast.success(`Imported ${success} leads${fail > 0 ? `, ${fail} failed` : ""}`);
    setOpen(false);
    reset();
    router.refresh();
  }

  const previewHeaders = rows.length > 0 ? Object.keys(rows[0]).slice(0, 5) : [];

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Upload className="h-4 w-4" /> Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Import Leads</DialogTitle>
          <DialogDescription>
            Upload an Excel (.xlsx) or CSV file. Download the template to ensure columns are mapped correctly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download template */}
          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
            <FileSpreadsheet className="h-8 w-8 text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Download Excel Template</p>
              <p className="text-xs text-muted-foreground">Pre-formatted with all columns, hints, and a sample row. Includes a pipeline stages reference sheet.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={() => downloadTemplate(stages)}
            >
              <Download className="h-4 w-4" />
              Template
            </Button>
          </div>

          {/* Upload area */}
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-0.5">Click to upload your file</p>
            <p className="text-xs text-muted-foreground">Supports .xlsx, .xls, and .csv</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          {/* Preview */}
          {rows.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-700">
                {rows.length} lead{rows.length !== 1 ? "s" : ""} detected — preview (first 5):
              </p>
              <div className="max-h-48 overflow-y-auto border rounded text-xs">
                <table className="w-full">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      {previewHeaders.map(h => (
                        <th key={h} className="px-2 py-1 text-left capitalize whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-t">
                        {previewHeaders.map((h, j) => (
                          <td key={j} className="px-2 py-1 truncate max-w-28">{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={reset} className="flex-1">
                  Clear
                </Button>
                <Button className="flex-2 flex-1" onClick={handleImport} disabled={loading}>
                  {loading && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                  Import {rows.length} Lead{rows.length !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          )}

          {/* Column reference */}
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground font-medium">
              View expected columns
            </summary>
            <div className="mt-2 border rounded overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-2 py-1 text-left">Column</th>
                    <th className="px-2 py-1 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {COLUMNS.map(c => (
                    <tr key={c.key} className="border-t">
                      <td className="px-2 py-1 font-mono font-medium whitespace-nowrap">{c.label}</td>
                      <td className="px-2 py-1 text-muted-foreground">{c.hint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </DialogContent>
    </Dialog>
  );
}
