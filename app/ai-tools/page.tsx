'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  BookOpen, 
  Mic, 
  Music, 
  Mail, 
  BarChart, 
  Heart,
  Loader2,
  Send,
  RefreshCw,
  Save,
  Copy,
  Download
} from 'lucide-react';

export default function AIToolsPage() {
  const [activeTab, setActiveTab] = useState('assistant');
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  
  // Simulate AI processing
  const processAIRequest = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setResult('');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate different responses based on active tab
    let response = '';
    switch (activeTab) {
      case 'assistant':
        response = `Here's my response to your question: "${input}"\n\nI'd recommend focusing on community building within your church by organizing small group activities that align with your members' interests. This can help foster deeper connections and engagement.`;
        break;
      case 'bible-tools':
        response = `Bible study insights for: "${input}"\n\nThis passage from John 3:16 is one of the most well-known verses in the Bible. It emphasizes God's love for humanity and the promise of eternal life through faith in Jesus Christ. The Greek word used for "love" here is "agape," which refers to a selfless, sacrificial love.`;
        break;
      case 'sermon':
        response = `Sermon outline for: "${input}"\n\n1. Introduction: Capturing the audience's attention with a relevant story\n2. Scripture Reading: John 15:1-17\n3. Main Points:\n   a. Understanding God's love as our foundation\n   b. How love transforms our relationships\n   c. Practical ways to show love in our community\n4. Application: Three steps to implement this week\n5. Conclusion: Call to action`;
        break;
      case 'worship':
        response = `Worship set suggestions for: "${input}"\n\n1. "Great Is Thy Faithfulness" (Traditional Hymn)\n2. "10,000 Reasons" by Matt Redman (Contemporary)\n3. "How Great Is Our God" by Chris Tomlin (Contemporary)\n4. "It Is Well With My Soul" (Traditional Hymn, modern arrangement)\n5. "Goodness of God" by Bethel Music (Contemporary)`;
        break;
      case 'email':
        response = `Email draft for: "${input}"\n\nSubject: Join Us This Sunday for a Special Community Celebration\n\nDear [Church Member],\n\nI hope this email finds you well. We're excited to invite you to our special community celebration this Sunday at 10:00 AM. This event will feature guest speakers, special music, and activities for all ages.\n\nWe look forward to seeing you there!\n\nWarmly,\n[Your Name]\n[Church Name]`;
        break;
      default:
        response = `I've processed your request: "${input}"\n\nHere are some insights that might help with your ministry planning.`;
    }
    
    setResult(response);
    setLoading(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processAIRequest();
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setInput('');
    setResult('');
  };
  
  const getPlaceholder = () => {
    switch (activeTab) {
      case 'assistant': return 'Ask me anything about church management...';
      case 'bible-tools': return 'Enter a Bible verse or topic to study...';
      case 'sermon': return 'What sermon topic are you preparing?';
      case 'worship': return "What's the theme for your worship service?";
      case 'email': return 'What type of email do you need to send?';
      case 'insights': return 'What insights are you looking for?';
      default: return 'How can I help you today?';
    }
  };
  
  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'assistant': return <Bot className="h-4 w-4" />;
      case 'bible-tools': return <BookOpen className="h-4 w-4" />;
      case 'sermon': return <Mic className="h-4 w-4" />;
      case 'worship': return <Music className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'insights': return <BarChart className="h-4 w-4" />;
      case 'pastoral': return <Heart className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Ministry Tools</h1>
          <p className="text-muted-foreground">
            AI-powered tools to enhance your ministry and administration.
          </p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:grid-cols-7 gap-2">
          <TabsTrigger value="assistant" className="flex items-center">
            {getTabIcon('assistant')}
            <span className="ml-2 hidden md:inline">Assistant</span>
          </TabsTrigger>
          <TabsTrigger value="bible-tools" className="flex items-center">
            {getTabIcon('bible-tools')}
            <span className="ml-2 hidden md:inline">Bible Tools</span>
          </TabsTrigger>
          <TabsTrigger value="sermon" className="flex items-center">
            {getTabIcon('sermon')}
            <span className="ml-2 hidden md:inline">Sermon</span>
          </TabsTrigger>
          <TabsTrigger value="worship" className="flex items-center">
            {getTabIcon('worship')}
            <span className="ml-2 hidden md:inline">Worship</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center">
            {getTabIcon('email')}
            <span className="ml-2 hidden md:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center">
            {getTabIcon('insights')}
            <span className="ml-2 hidden md:inline">Insights</span>
          </TabsTrigger>
          <TabsTrigger value="pastoral" className="flex items-center">
            {getTabIcon('pastoral')}
            <span className="ml-2 hidden md:inline">Pastoral</span>
          </TabsTrigger>
        </TabsList>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {getTabIcon(activeTab)}
              <span className="ml-2">
                {activeTab === 'assistant' && 'AI Assistant'}
                {activeTab === 'bible-tools' && 'Bible Study Tools'}
                {activeTab === 'sermon' && 'Sermon Assistant'}
                {activeTab === 'worship' && 'Worship Planner'}
                {activeTab === 'email' && 'Email Generator'}
                {activeTab === 'insights' && 'Insights Dashboard'}
                {activeTab === 'pastoral' && 'Pastoral Care Assistant'}
              </span>
            </CardTitle>
            <CardDescription>
              {activeTab === 'assistant' && 'Get help with church management questions'}
              {activeTab === 'bible-tools' && 'Study the Bible with AI-powered insights'}
              {activeTab === 'sermon' && 'Generate sermon outlines and ideas'}
              {activeTab === 'worship' && 'Plan worship sets and music selections'}
              {activeTab === 'email' && 'Create professional emails for your congregation'}
              {activeTab === 'insights' && 'Analyze church data for actionable insights'}
              {activeTab === 'pastoral' && 'Get assistance with pastoral care needs'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea 
                placeholder={getPlaceholder()}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[100px]"
              />
              
              <div className="flex justify-end">
                <Button type="submit" disabled={loading || !input.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </form>
            
            {result && (
              <div className="mt-6">
                <div className="border rounded-md p-4 bg-muted/30">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">AI Response</h3>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap">{result}</div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Powered by AI. Results may need human review.
            </p>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardFooter>
        </Card>
      </Tabs>
    </div>
  );
}