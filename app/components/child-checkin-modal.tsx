"use client";

import { useState } from "react";
import { DialogShell } from "./_shared/dialog-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QrCode, Printer, CheckCircle } from "lucide-react";
import QRCode from "react-qr-code";
import { DatabaseService, type Member } from "@/lib/database";

function generateTagCode(childId: string, parentId: string) {
  // Simple unique code: could be improved for security
  return btoa(`${childId}:${parentId}:${Date.now()}`).slice(0, 10).toUpperCase();
}

interface ChildCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenMembers: Member[];
  parentMembers: Member[];
}

export function ChildCheckInModal({ isOpen, onClose, childrenMembers, parentMembers }: ChildCheckInModalProps) {
  const [selectedChild, setSelectedChild] = useState<Member | null>(null);
  const [selectedParent, setSelectedParent] = useState<Member | null>(null);
  const [tagCode, setTagCode] = useState<string | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<"success" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    if (!selectedChild || !selectedParent) return;
    setLoading(true);
    try {
      const code = generateTagCode(selectedChild.id, selectedParent.id);
      setTagCode(code);
      await DatabaseService.recordAttendance({
        member_id: selectedChild.id,
        event_id: null,
        attendance_type: "child",
        notes: `Child check-in, parent: ${selectedParent.first_name} ${selectedParent.last_name}, tag: ${code}`,
      });
      setCheckInStatus("success");
    } catch (e) {
      console.error("Child check-in error:", e);
      // You could add error state handling here if needed
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DialogShell isOpen={isOpen} onClose={onClose} title="Child Check-In & Security Tag">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Child Check-In
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checkInStatus === "success" && tagCode && selectedChild && selectedParent ? (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
              <div className="flex flex-col items-center gap-2 print:border print:p-4 print:mb-4">
                <Badge className="text-lg">Security Tag</Badge>
                <QRCode value={tagCode} size={96} />
                <div className="font-bold">Code: {tagCode}</div>
                <div className="text-sm">Child: {selectedChild.first_name} {selectedChild.last_name}</div>
                <div className="text-sm">Parent: {selectedParent.first_name} {selectedParent.last_name}</div>
              </div>
              <Button onClick={handlePrint} variant="outline" className="mb-2">
                <Printer className="h-4 w-4 mr-2" /> Print Tag
              </Button>
              <Button onClick={onClose}>Done</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block mb-1 font-medium">Select Child</label>
                <Input
                  list="children-list"
                  placeholder="Type to search..."
                  value={selectedChild ? `${selectedChild.first_name} ${selectedChild.last_name}` : ""}
                  onChange={e => {
                    const val = e.target.value.toLowerCase();
                    const found = childrenMembers.find(m => `${m.first_name} ${m.last_name}`.toLowerCase() === val);
                    setSelectedChild(found || null);
                  }}
                />
                <datalist id="children-list">
                  {childrenMembers.map(child => (
                    <option key={child.id} value={`${child.first_name} ${child.last_name}`} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block mb-1 font-medium">Select Parent/Guardian</label>
                <Input
                  list="parents-list"
                  placeholder="Type to search..."
                  value={selectedParent ? `${selectedParent.first_name} ${selectedParent.last_name}` : ""}
                  onChange={e => {
                    const val = e.target.value.toLowerCase();
                    const found = parentMembers.find(m => `${m.first_name} ${m.last_name}`.toLowerCase() === val);
                    setSelectedParent(found || null);
                  }}
                />
                <datalist id="parents-list">
                  {parentMembers.map(parent => (
                    <option key={parent.id} value={`${parent.first_name} ${parent.last_name}`} />
                  ))}
                </datalist>
              </div>
              <Button onClick={handleCheckIn} disabled={!selectedChild || !selectedParent || loading}>
                Generate Security Tag & Check-In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </DialogShell>
  );
} 