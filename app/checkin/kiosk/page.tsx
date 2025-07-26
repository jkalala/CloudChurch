"use client";

import { useState } from "react";
import { QRCheckInModal } from "../../components/qr-checkin-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatabaseService, type Member } from "@/lib/database";
import { QrCode, Search } from "lucide-react";

export default function KioskCheckInPage() {
  const [showQRModal, setShowQRModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [checkInStatus, setCheckInStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Search members by name (simple demo, adjust as needed)
      const allMembers = await DatabaseService.getMembers();
      const results = allMembers.filter((m: Member) =>
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } catch (e) {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (member: Member) => {
    setLoading(true);
    try {
      await DatabaseService.recordAttendance({ 
        member_id: member.id, 
        event_id: null, 
        attendance_type: "kiosk", 
        notes: "Kiosk check-in" 
      });
      setCheckInStatus(`Checked in: ${member.first_name} ${member.last_name}`);
    } catch (e) {
      console.error("Kiosk check-in error:", e);
      setCheckInStatus("Check-in failed. Try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setCheckInStatus(null), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <QrCode className="h-7 w-7" />
            Kiosk Check-In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button size="lg" className="w-full" onClick={() => setShowQRModal(true)}>
              <QrCode className="h-5 w-5 mr-2" />
              Check in with QR Code
            </Button>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                className="flex-1"
                disabled={loading}
              />
              <Button onClick={handleSearch} disabled={loading} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 space-y-2">
                {searchResults.map(member => (
                  <Button
                    key={member.id}
                    className="w-full justify-start"
                    onClick={() => handleCheckIn(member)}
                    disabled={loading}
                  >
                    {member.first_name} {member.last_name}
                  </Button>
                ))}
              </div>
            )}
            {checkInStatus && <div className="text-center text-green-600 font-semibold mt-2">{checkInStatus}</div>}
          </div>
        </CardContent>
      </Card>
      <QRCheckInModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
    </div>
  );
} 