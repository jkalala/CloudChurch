"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatabaseService } from "@/lib/database";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function TestCheckInPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testMemberId = "550e8400-e29b-41d4-a716-446655440010"; // Sarah Johnson from sample data

  const handleTestCheckIn = async () => {
    setLoading(true);
    setStatus(null);
    try {
      await DatabaseService.recordAttendance({
        member_id: testMemberId,
        event_id: null,
        attendance_type: "test",
        notes: "Test check-in from test page"
      });
      setStatus("success");
    } catch (e) {
      console.error("Test check-in error:", e);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Test Check-In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            This page tests the check-in functionality using sample member data.
          </p>
          
          <Button 
            onClick={handleTestCheckIn} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Testing..." : "Test Check-In"}
          </Button>

          {status === "success" && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Check-in successful!</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Check-in failed. Check console for details.</span>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-4">
            <p>Test Member ID: {testMemberId}</p>
            <p>Member: Sarah Johnson (from sample data)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 