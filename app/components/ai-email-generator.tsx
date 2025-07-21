"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mail, Send, Users, Heart, Calendar, Gift, Sparkles, Copy, Download, Eye, Info } from "lucide-react"
import { AIEmailService, type EmailTemplate, type GeneratedEmail } from "@/lib/ai-email-service"
import { useTranslation } from "@/lib/i18n"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Custom hook for email generation logic
interface UseEmailGenerationParams {
  selectedTemplate: string;
  selectedMembers: string[];
  customContext: Record<string, string>;
  setGeneratedEmails: React.Dispatch<React.SetStateAction<GeneratedEmail[]>>;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
}
export function useEmailGeneration({ selectedTemplate, selectedMembers, customContext, setGeneratedEmails, setIsGenerating }: UseEmailGenerationParams) {
  const handleGenerateEmails = useCallback(async () => {
    if (!selectedTemplate || selectedMembers.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a template and at least one member.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const emails = await AIEmailService.generateBulkEmails(
        selectedMembers,
        selectedTemplate as EmailTemplate["type"],
        customContext,
      );
      setGeneratedEmails(emails);
      toast({
        title: "Emails Generated Successfully",
        description: `Generated ${emails.length} personalized emails.`,
      });
    } catch (error) {
      console.error("Error generating emails:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTemplate, selectedMembers, customContext, setGeneratedEmails, setIsGenerating]);
  return { handleGenerateEmails };
}

export default function AIEmailGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [customContext, setCustomContext] = useState<Record<string, string>>({})
  const [generatedEmails, setGeneratedEmails] = useState<GeneratedEmail[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewEmail, setPreviewEmail] = useState<GeneratedEmail | null>(null)
  const [showHelpBanner, setShowHelpBanner] = useState(true)

  const { language } = useAuth()
  const { t } = useTranslation(language)

  const emailTypes = [
    { value: "pastoral_care", label: "Pastoral Care", icon: Heart, color: "text-pink-500" },
    { value: "welcome", label: "Welcome New Members", icon: Users, color: "text-green-500" },
    { value: "follow_up", label: "Follow Up", icon: Mail, color: "text-blue-500" },
    { value: "event_invitation", label: "Event Invitation", icon: Calendar, color: "text-purple-500" },
    { value: "birthday", label: "Birthday Wishes", icon: Gift, color: "text-orange-500" },
    { value: "newsletter", label: "Newsletter", icon: Send, color: "text-cyan-500" },
  ]

  const { handleGenerateEmails } = useEmailGeneration({ selectedTemplate, selectedMembers, customContext, setGeneratedEmails, setIsGenerating });

  const handleCopyEmail = (email: GeneratedEmail) => {
    navigator.clipboard.writeText(email.content)
    toast({
      title: "Copied to Clipboard",
      description: "Email content copied successfully.",
    })
  }

  const handlePreviewEmail = (email: GeneratedEmail) => {
    setPreviewEmail(email)
  }

  const mockMembers = [
    { id: "1", name: "João Silva", email: "joao@email.com", status: "inactive" },
    { id: "2", name: "Maria Santos", email: "maria@email.com", status: "new" },
    { id: "3", name: "Pedro Costa", email: "pedro@email.com", status: "active" },
    { id: "4", name: "Ana Oliveira", email: "ana@email.com", status: "birthday" },
  ]

  return (
    <div className="space-y-6">
      {/* Onboarding/Help Banner */}
      {showHelpBanner && (
        <Card className="bg-blue-50 border-blue-200 mb-4">
          <CardContent className="flex items-center gap-4 py-4">
            <Info className="h-6 w-6 text-blue-500" />
            <div className="flex-1">
              <div className="font-semibold text-blue-700">Welcome to the AI Email Generator!</div>
              <div className="text-sm text-blue-700">
                Generate personalized emails for your church. Select a template, choose members, and add a custom message. Hover over fields and buttons for tips.
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setShowHelpBanner(false)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
          <Mail className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Email Generator</h2>
          <p className="text-gray-600">Generate personalized emails with artificial intelligence</p>
        </div>
      </div>
      <TooltipProvider>
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generator">Email Generator</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="history">Generated Emails</TabsTrigger>
          </TabsList>
          <TabsContent value="generator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuration Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    Email Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Email Type Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                      Email Type
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>Select the type of email to generate.</TooltipContent>
                      </Tooltip>
                    </label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select email type" />
                      </SelectTrigger>
                      <SelectContent>
                        {emailTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className={`h-4 w-4 ${type.color}`} />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Member Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                      Select Members
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>Choose which members will receive the email.</TooltipContent>
                      </Tooltip>
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {mockMembers.map((member) => (
                        <div key={member.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={member.id}
                            checked={selectedMembers.includes(member.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMembers([...selectedMembers, member.id])
                              } else {
                                setSelectedMembers(selectedMembers.filter((id) => id !== member.id))
                              }
                            }}
                            className="rounded"
                          />
                          <label htmlFor={member.id} className="text-sm flex-1">
                            {member.name}
                            <Badge variant="outline" className="ml-2 text-xs">
                              {member.status}
                            </Badge>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Custom Context */}
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                      Custom Message (Optional)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>Add a custom message or context for the email.</TooltipContent>
                      </Tooltip>
                    </label>
                    <Textarea
                      placeholder="Add any specific context or custom message..."
                      value={customContext.custom_message || ""}
                      onChange={(e) =>
                        setCustomContext({
                          ...customContext,
                          custom_message: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                  {/* Generate Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleGenerateEmails}
                        disabled={isGenerating || !selectedTemplate || selectedMembers.length === 0}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        {isGenerating ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Generating...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Generate AI Emails
                          </div>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Generate personalized emails for the selected members.</TooltipContent>
                  </Tooltip>
                </CardContent>
              </Card>
              {/* Preview Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-500" />
                    Email Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {previewEmail ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">To:</label>
                        <p className="font-medium">{previewEmail.to}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Subject:</label>
                        <p className="font-medium">{previewEmail.subject}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Content:</label>
                        <ScrollArea className="h-64 w-full border rounded-lg p-3">
                          <pre className="whitespace-pre-wrap text-sm">{previewEmail.content}</pre>
                        </ScrollArea>
                      </div>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleCopyEmail(previewEmail)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy the email content to clipboard.</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Export the email as a text file.</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Generate emails to see preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-4">
              {emailTypes.map((template) => (
                <Card key={template.value}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.label}</CardTitle>
                      <Badge variant="outline">{template.value.replace("_", " ")}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Tone:</label>
                        <p className="capitalize">{template.value.split("_").join(" ")}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Variables:</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.value.split("_").map((variable) => (
                            <Badge key={variable} variant="secondary" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Preview:</label>
                        <ScrollArea className="h-32 w-full border rounded-lg p-3 mt-1">
                          <pre className="whitespace-pre-wrap text-xs text-gray-700">
                            {template.value.split("_").join(" ")}
                          </pre>
                        </ScrollArea>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="history" className="space-y-4">
            {generatedEmails.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Generated Emails</h3>
                  <p className="text-gray-600">Generate your first AI-powered emails to see them here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {generatedEmails.map((email, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{email.subject}</CardTitle>
                          <p className="text-sm text-gray-600">To: {email.to}</p>
                        </div>
                        <Badge variant="outline">{email.type.replace("_", " ")}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <ScrollArea className="h-32 w-full border rounded-lg p-3">
                          <pre className="whitespace-pre-wrap text-sm">{email.content.substring(0, 200)}...</pre>
                        </ScrollArea>
                        <div className="flex gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handlePreviewEmail(email)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Preview the full email content.</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleCopyEmail(email)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy the email content to clipboard.</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Send className="h-4 w-4 mr-2" />
                                Send
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Send this email to the recipient.</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </TooltipProvider>
    </div>
  )
}
