"use client";

import { useState } from "react";
import { DialogShell } from "./_shared/dialog-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatabaseService } from "@/lib/database";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface MemberImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

export function MemberImportModal({ isOpen, onClose, onImportComplete }: MemberImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setData([]);
    setPreview([]);
    setError(null);
    setResult(null);
    if (!f) return;
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (ext === "csv") {
      Papa.parse(f, {
        header: true,
        complete: (res) => {
          setData(res.data as any[]);
          setPreview((res.data as any[]).slice(0, 5));
        },
        error: (err) => setError(err.message),
      });
    } else if (["xlsx", "xls"].includes(ext || "")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const wb = XLSX.read(evt.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws);
        setData(json as any[]);
        setPreview((json as any[]).slice(0, 5));
      };
      reader.readAsBinaryString(f);
    } else {
      setError("Unsupported file type. Please upload a CSV or Excel file.");
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setError(null);
    setResult(null);
    let success = 0;
    let failed = 0;
    for (const row of data) {
      try {
        await DatabaseService.addMember({
          first_name: row.first_name || row["First Name"] || row["firstName"],
          last_name: row.last_name || row["Last Name"] || row["lastName"],
          email: row.email,
          phone: row.phone,
          date_of_birth: row.date_of_birth || row["Date of Birth"] || row["dob"],
          family_id: row.family_id,
          custom_fields: Object.keys(row)
            .filter(k => !["first_name", "First Name", "firstName", "last_name", "Last Name", "lastName", "email", "phone", "date_of_birth", "Date of Birth", "dob", "family_id"].includes(k))
            .map(k => ({ key: k, value: row[k] })),
        });
        success++;
      } catch {
        failed++;
      }
    }
    setResult(`Imported: ${success}, Failed: ${failed}`);
    setImporting(false);
    if (onImportComplete) onImportComplete();
  };

  return (
    <DialogShell isOpen={isOpen} onClose={onClose} title="Import Members">
      <div className="space-y-4">
        <Input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
        {preview.length > 0 && (
          <div className="bg-gray-50 border rounded p-2">
            <div className="font-semibold mb-2">Preview (first 5 rows):</div>
            <pre className="text-xs overflow-x-auto">{JSON.stringify(preview, null, 2)}</pre>
          </div>
        )}
        {error && <div className="text-red-600">{error}</div>}
        {result && <div className="text-green-700">{result}</div>}
        <Button onClick={handleImport} disabled={importing || data.length === 0} className="w-full">
          {importing ? "Importing..." : "Import Members"}
        </Button>
      </div>
    </DialogShell>
  );
} 