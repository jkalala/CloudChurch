import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const sections = [
  { id: "overview", label: "Overview" },
  { id: "getting-started", label: "Getting Started" },
  { id: "ai-tools", label: "AI Tools" },
  { id: "member-management", label: "Member Management" },
  { id: "resource-library", label: "Resource Library" },
  { id: "streaming-integrations", label: "Streaming & Integrations" },
  { id: "admin-advanced", label: "Admin & Advanced" },
  { id: "troubleshooting", label: "Troubleshooting & FAQ" },
  { id: "developer-guide", label: "Developer Guide" },
]

export const themeColor = "#000000";
export const viewport = "width=device-width, initial-scale=1, maximum-scale=1";

export default function DocumentationPage() {
  return (
    <div className="flex max-w-6xl mx-auto p-6 gap-8">
      {/* Sidebar Navigation */}
      <nav className="w-56 flex-shrink-0 hidden md:block">
        <ul className="space-y-2 sticky top-8">
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="text-blue-700 hover:underline font-medium">
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {/* Main Content */}
      <div className="flex-1 space-y-8">
        <section id="overview">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p>MobileChurch is a modern church management platform with AI-powered tools, member management, resource library, streaming integrations, and more. It is designed for church admins, staff, and members to streamline operations, communication, and spiritual growth.</p>
            </CardContent>
          </Card>
        </section>
        <section id="getting-started">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-1">
                <li>System requirements: Node.js 18+, pnpm or npm, Supabase account</li>
                <li>Install dependencies and set up environment variables</li>
                <li>Run database migrations (see <code>/scripts</code>)</li>
                <li>Create a Supabase Storage bucket named <b>resources</b></li>
                <li>Start the app and log in</li>
              </ul>
            </CardContent>
          </Card>
        </section>
        <section id="ai-tools">
          <Card>
            <CardHeader>
              <CardTitle>AI Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-1">
                <li><b>AI Bible Tools:</b> Search, devotionals, and study tabs for Bible engagement</li>
                <li><b>AI Sermon Assistant:</b> Generate outlines, reorder points, find supporting verses</li>
                <li><b>AI Music Ministry Tools:</b> Plan music, get suggestions, use onboarding/help</li>
                <li><b>AI Worship Planner, Insights Dashboard, Email Generator:</b> Use onboarding, filters, and export features</li>
              </ul>
            </CardContent>
          </Card>
        </section>
        <section id="member-management">
          <Card>
            <CardHeader>
              <CardTitle>Member Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-1">
                <li>Add, edit, delete members</li>
                <li>Bulk actions: activate, deactivate, assign department, delete</li>
                <li>Multiple views: table, cards, grid, list, contact</li>
                <li>Department assignment and filters</li>
              </ul>
            </CardContent>
          </Card>
        </section>
        <section id="resource-library">
          <Card>
            <CardHeader>
              <CardTitle>Resource Library</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-1">
                <li>Upload, search, preview, download, and delete resources</li>
                <li>Supported file types: PDF, MP3, MP4, DOCX, images, etc.</li>
                <li>Files stored in Supabase Storage (<b>resources</b> bucket)</li>
              </ul>
            </CardContent>
          </Card>
        </section>
        <section id="streaming-integrations">
          <Card>
            <CardHeader>
              <CardTitle>Streaming Platform & Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-1">
                <li>Connect to Zoom, WhatsApp, Mailchimp, Google Calendar</li>
                <li>Use the Integrations card in streaming settings</li>
                <li>Simulated OAuth flows for demo/testing</li>
              </ul>
            </CardContent>
          </Card>
        </section>
        <section id="admin-advanced">
          <Card>
            <CardHeader>
              <CardTitle>Admin & Advanced Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-1">
                <li>Manage users and roles</li>
                <li>Feature flags and settings</li>
                <li>Running database migrations</li>
                <li>Setting up Supabase Storage buckets</li>
                <li>Row Level Security (RLS) basics</li>
              </ul>
            </CardContent>
          </Card>
        </section>
        <section id="troubleshooting">
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting & FAQ</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-1">
                <li>Common issues and solutions</li>
                <li>Where to get help (GitHub Issues, email, etc.)</li>
              </ul>
            </CardContent>
          </Card>
        </section>
        <section id="developer-guide">
          <Card>
            <CardHeader>
              <CardTitle>Developer Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-1">
                <li>Project structure overview</li>
                <li>Adding new features/modules</li>
                <li>API endpoints and conventions</li>
                <li>Testing and contributing</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
