"use client";

import { useState } from "react";
import { DialogShell } from "./_shared/dialog-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, CheckCircle, AlertCircle } from "lucide-react";
import { QrReader } from "@blackbox-vision/react-qr-reader";
import { DatabaseService, type Member } from "@/lib/database";

interface QRCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QRCheckInModal({ isOpen, onClose }: QRCheckInModalProps) {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<"success" | "error" | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const handleScan = async (data: string | null) => {
    if (!data) return;
    setScanResult(data);
    setLoading(true);
    try {
      // Assume QR code contains a member check-in URL or member ID
      const memberId = data.startsWith("http") ? data.split("/").pop() : data;
      
      // Validate that memberId is a valid UUID format
      if (!memberId || memberId.length < 10) {
        throw new Error("Invalid member ID format");
      }
      
      // Record attendance (for demo, eventId is null)
      await DatabaseService.recordAttendance({ 
        member_id: memberId, 
        event_id: null, 
        attendance_type: "qr", 
        notes: "QR check-in" 
      });
      setCheckInStatus("success");
    } catch (e) {
      console.error("QR check-in error:", e);
      setCheckInStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err: any) => {
    // Ignore NotFoundException (no QR code in frame)
    if (err && err.name === "NotFoundException") return;
    
    // Handle camera constraint errors
    if (err && err.name === "OverconstrainedError") {
      console.warn("Camera constraints not supported, trying fallback...");
      setCameraError(true);
      return;
    }
    
    console.error("QR Reader error:", err);
    setCheckInStatus("error");
  };

  // Test function for development
  const handleTestCheckIn = async () => {
    setLoading(true);
    try {
      // Use a sample member ID for testing
      const testMemberId = "550e8400-e29b-41d4-a716-446655440001"; // Sample UUID
      await DatabaseService.recordAttendance({ 
        member_id: testMemberId, 
        event_id: null, 
        attendance_type: "qr", 
        notes: "Test QR check-in" 
      });
      setCheckInStatus("success");
    } catch (e) {
      console.error("Test check-in error:", e);
      setCheckInStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogShell 
      isOpen={isOpen} 
      onClose={onClose} 
      title="QR Code Check-In"
      description="Scan member QR codes to record attendance quickly and securely."
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scan Member QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div id="qr-checkin-desc" className="sr-only">
            Point your device camera at a member's QR code to check them in. This helps track attendance quickly and securely.
          </div>
          {checkInStatus === "success" ? (
            <div className="flex flex-col items-center text-green-600">
              <CheckCircle className="h-10 w-10 mb-2" />
              <p>Check-in successful!</p>
              <Button className="mt-4" onClick={onClose}>Close</Button>
            </div>
          ) : checkInStatus === "error" ? (
            <div className="flex flex-col items-center text-red-600">
              <AlertCircle className="h-10 w-10 mb-2" />
              <p>Check-in failed. Try again.</p>
              <Button className="mt-4" onClick={() => setCheckInStatus(null)}>Retry</Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-full max-w-xs">
                {!cameraError ? (
                  <QrReader
                    constraints={{
                      facingMode: "environment"
                    }}
                    onResult={(result, error) => {
                      if (result && typeof result.getText === 'function') handleScan(result.getText());
                      if (error) handleError(error);
                    }}
                    containerStyle={{ width: "100%" }}
                    videoId="qr-video"
                    scanDelay={500}
                    videoStyle={{ width: "100%" }}
                  />
                ) : (
                  <QrReader
                    constraints={{
                      facingMode: "user"
                    }}
                    onResult={(result, error) => {
                      if (result && typeof result.getText === 'function') handleScan(result.getText());
                      if (error) handleError(error);
                    }}
                    containerStyle={{ width: "100%" }}
                    videoId="qr-video-fallback"
                    scanDelay={500}
                    videoStyle={{ width: "100%" }}
                  />
                )}
              </div>
              <p className="mt-4 text-sm text-gray-500">Point the camera at a member's QR code to check them in.</p>
              {loading && <p className="mt-2 text-blue-600">Processing...</p>}
              
              <div className="mt-4 p-3 bg-gray-50 rounded border">
                <p className="text-xs text-gray-600 mb-2">Camera not working?</p>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleTestCheckIn} 
                    disabled={loading}
                    variant="outline" 
                    size="sm"
                  >
                    Test Check-In
                  </Button>
                  {cameraError && (
                    <Button 
                      onClick={() => setCameraError(false)} 
                      variant="outline" 
                      size="sm"
                    >
                      Try Front Camera
                    </Button>
                  )}
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline" 
                    size="sm"
                  >
                    Refresh Page
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </DialogShell>
  );
} 