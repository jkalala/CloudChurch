"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseService } from "@/lib/database";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { AIClient } from "@/lib/ai-client";

interface AttendanceRecord {
  id: string;
  member_id: string;
  event_id: string | null;
  check_in_time: string;
  attendance_type: string;
  notes?: string;
}

export default function AttendanceAnalyticsPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ totalRecords: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [attendance, stats] = await Promise.all([
          DatabaseService.getAttendanceRecords(),
          DatabaseService.getAttendanceStats(),
        ]);
        setRecords(attendance);
        setStats(stats);
      } catch (e) {
        setError("Failed to load attendance data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Group by date for bar chart
  const attendanceByDate = records.reduce((acc, rec) => {
    const date = rec.check_in_time.slice(0, 10);
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const chartData = Object.entries(attendanceByDate).map(([date, count]) => ({ date, count }));

  // Check-in method breakdown
  const methodCounts = records.reduce((acc, rec) => {
    acc[rec.attendance_type] = (acc[rec.attendance_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleAIInsights = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      // Prepare a summary of attendance by date and method for the AI
      const summary = records.map(r => ({
        date: r.check_in_time.slice(0, 10),
        method: r.attendance_type,
      }));
      const prompt = `Analyze the following church attendance data and provide a summary of trends, patterns, and any actionable insights. Data: ${JSON.stringify(summary)}`;
      const response = await AIClient.generateText(prompt);
      setAiResult(response || "No insights returned.");
    } catch (e) {
      setAiResult("Failed to generate AI insights.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <Card className="max-w-3xl mx-auto mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Attendance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <div className="space-y-6">
              <div className="flex gap-8 items-center">
                <div className="text-3xl font-bold">{stats?.totalRecords ?? 0}</div>
                <div className="text-gray-600">Total Check-Ins</div>
              </div>
              <div className="flex gap-4 flex-wrap">
                {Object.entries(methodCounts).map(([method, count]) => (
                  <div key={method} className="bg-blue-100 text-blue-800 rounded px-3 py-1 font-semibold">
                    {method}: {count}
                  </div>
                ))}
              </div>
              <div>
                <div className="font-semibold mb-2">Attendance Over Time</div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#2563eb" name="Check-Ins" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* AI Insights Section */}
              <div className="mt-8">
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardHeader>
                    <CardTitle>AI Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-600 mb-4">Click below to generate AI-powered analysis of your attendance data using OpenAI.</div>
                    <Button className="mb-4" onClick={handleAIInsights} disabled={aiLoading || records.length === 0}>
                      {aiLoading ? "Generating..." : "Generate AI Insights"}
                    </Button>
                    {aiResult && (
                      <div className="bg-white border rounded p-4 text-gray-800 whitespace-pre-line">
                        {aiResult}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 