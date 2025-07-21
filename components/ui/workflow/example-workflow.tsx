'use client';

import React, { useState } from 'react';
import { WorkflowContainer } from './workflow-container';
import { WorkflowStepProps } from '@/lib/contexts/workflow-context';
import { createWorkflowStep } from '@/lib/utils/workflow-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircledIcon } from '@radix-ui/react-icons';

// Step 1: Basic Information
const BasicInfoStep: React.FC<WorkflowStepProps> = ({ 
  stepData, 
  updateStepData 
}) => {
  const [title, setTitle] = useState(stepData.title || '');
  const [description, setDescription] = useState(stepData.description || '');
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    updateStepData({ title: e.target.value });
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    updateStepData({ description: e.target.value });
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title" 
          value={title} 
          onChange={handleTitleChange} 
          placeholder="Enter a title"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          value={description} 
          onChange={handleDescriptionChange}
          placeholder="Enter a description"
          rows={4}
        />
      </div>
    </div>
  );
};

// Step 2: Type Selection
const TypeSelectionStep: React.FC<WorkflowStepProps> = ({ 
  stepData, 
  updateStepData 
}) => {
  const [type, setType] = useState(stepData.type || '');
  
  const handleTypeChange = (value: string) => {
    setType(value);
    updateStepData({ type: value });
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Select Type</Label>
        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger id="type">
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="announcement">Announcement</SelectItem>
            <SelectItem value="event">Event</SelectItem>
            <SelectItem value="prayer">Prayer Request</SelectItem>
            <SelectItem value="resource">Resource</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {type && (
        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
          <AlertDescription className="text-blue-700 dark:text-blue-400">
            You selected: <strong>{type.charAt(0).toUpperCase() + type.slice(1)}</strong>
            {type === 'event' && ' - You will be asked for date and time information next.'}
            {type === 'prayer' && ' - You will be asked for privacy settings next.'}
            {type === 'resource' && ' - You will be asked to upload files next.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// Step 3A: Event Details (Conditional)
const EventDetailsStep: React.FC<WorkflowStepProps> = ({ 
  stepData, 
  updateStepData 
}) => {
  const [date, setDate] = useState(stepData.date || '');
  const [time, setTime] = useState(stepData.time || '');
  const [location, setLocation] = useState(stepData.location || '');
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    updateStepData({ date: e.target.value });
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
    updateStepData({ time: e.target.value });
  };
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
    updateStepData({ location: e.target.value });
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input 
          id="date" 
          type="date" 
          value={date} 
          onChange={handleDateChange} 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="time">Time</Label>
        <Input 
          id="time" 
          type="time" 
          value={time} 
          onChange={handleTimeChange} 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input 
          id="location" 
          value={location} 
          onChange={handleLocationChange} 
          placeholder="Enter a location"
        />
      </div>
    </div>
  );
};

// Step 3B: Prayer Request Details (Conditional)
const PrayerDetailsStep: React.FC<WorkflowStepProps> = ({ 
  stepData, 
  updateStepData 
}) => {
  const [privacy, setPrivacy] = useState(stepData.privacy || 'public');
  const [urgent, setUrgent] = useState(stepData.urgent || false);
  
  const handlePrivacyChange = (value: string) => {
    setPrivacy(value);
    updateStepData({ privacy: value });
  };
  
  const handleUrgentChange = (value: string) => {
    const isUrgent = value === 'yes';
    setUrgent(isUrgent);
    updateStepData({ urgent: isUrgent });
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="privacy">Privacy Level</Label>
        <Select value={privacy} onValueChange={handlePrivacyChange}>
          <SelectTrigger id="privacy">
            <SelectValue placeholder="Select privacy level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public (Everyone)</SelectItem>
            <SelectItem value="members">Members Only</SelectItem>
            <SelectItem value="staff">Staff Only</SelectItem>
            <SelectItem value="private">Private (Prayer Team Only)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="urgent">Is this an urgent request?</Label>
        <Select value={urgent ? 'yes' : 'no'} onValueChange={handleUrgentChange}>
          <SelectTrigger id="urgent">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Step 3C: Resource Details (Conditional)
const ResourceDetailsStep: React.FC<WorkflowStepProps> = ({ 
  stepData, 
  updateStepData 
}) => {
  const [category, setCategory] = useState(stepData.category || '');
  const [tags, setTags] = useState(stepData.tags || '');
  
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    updateStepData({ category: value });
  };
  
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value);
    updateStepData({ tags: e.target.value });
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sermon">Sermon</SelectItem>
            <SelectItem value="study">Bible Study</SelectItem>
            <SelectItem value="music">Music</SelectItem>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input 
          id="tags" 
          value={tags} 
          onChange={handleTagsChange} 
          placeholder="Enter tags separated by commas"
        />
      </div>
      
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          File upload will be available in the next step.
        </p>
      </div>
    </div>
  );
};

// Step 4: Confirmation
const ConfirmationStep: React.FC<WorkflowStepProps> = ({ 
  stepData 
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Summary</h3>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
          <p><strong>Title:</strong> {stepData.title || 'Not provided'}</p>
          <p><strong>Type:</strong> {stepData.type ? stepData.type.charAt(0).toUpperCase() + stepData.type.slice(1) : 'Not selected'}</p>
          <p><strong>Description:</strong> {stepData.description || 'Not provided'}</p>
          
          {stepData.type === 'event' && (
            <>
              <p><strong>Date:</strong> {stepData.date || 'Not provided'}</p>
              <p><strong>Time:</strong> {stepData.time || 'Not provided'}</p>
              <p><strong>Location:</strong> {stepData.location || 'Not provided'}</p>
            </>
          )}
          
          {stepData.type === 'prayer' && (
            <>
              <p><strong>Privacy:</strong> {stepData.privacy || 'Not provided'}</p>
              <p><strong>Urgent:</strong> {stepData.urgent ? 'Yes' : 'No'}</p>
            </>
          )}
          
          {stepData.type === 'resource' && (
            <>
              <p><strong>Category:</strong> {stepData.category || 'Not provided'}</p>
              <p><strong>Tags:</strong> {stepData.tags || 'Not provided'}</p>
            </>
          )}
        </div>
      </div>
      
      <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900">
        <CheckCircledIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertDescription className="text-green-700 dark:text-green-400">
          Your {stepData.type || 'item'} is ready to be submitted.
        </AlertDescription>
      </Alert>
    </div>
  );
};

interface ExampleWorkflowProps {
  onComplete?: (data: Record<string, any>) => void;
  className?: string;
}

export const ExampleWorkflow: React.FC<ExampleWorkflowProps> = ({ 
  onComplete,
  className
}) => {
  // Create the workflow steps
  const steps = [
    createWorkflowStep('basic-info', 'Basic Info', BasicInfoStep),
    createWorkflowStep('type-selection', 'Type', TypeSelectionStep),
    createWorkflowStep('event-details', 'Event Details', EventDetailsStep),
    createWorkflowStep('prayer-details', 'Prayer Details', PrayerDetailsStep),
    createWorkflowStep('resource-details', 'Resource Details', ResourceDetailsStep),
    createWorkflowStep('confirmation', 'Confirmation', ConfirmationStep)
  ];
  
  // Define conditional paths based on the selected type
  const conditionalSteps = steps.map(step => {
    if (step.id === 'type-selection') {
      return {
        ...step,
        nextStepId: (data: Record<string, any>) => {
          switch (data.type) {
            case 'event':
              return 'event-details';
            case 'prayer':
              return 'prayer-details';
            case 'resource':
              return 'resource-details';
            default:
              return 'confirmation';
          }
        }
      };
    }
    
    // Connect all detail steps to the confirmation step
    if (['event-details', 'prayer-details', 'resource-details'].includes(step.id)) {
      return {
        ...step,
        nextStepId: 'confirmation'
      };
    }
    
    return step;
  });
  
  const handleComplete = (data: Record<string, any>) => {
    console.log('Workflow completed with data:', data);
    onComplete?.(data);
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Create New Item</CardTitle>
        <CardDescription>
          Follow the steps to create a new item in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <WorkflowContainer
          steps={conditionalSteps}
          onComplete={handleComplete}
          orientation="horizontal"
          showLabels={true}
          showProgress={true}
        />
      </CardContent>
    </Card>
  );
};

export default ExampleWorkflow;