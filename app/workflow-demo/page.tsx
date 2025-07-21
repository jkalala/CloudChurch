'use client';

import React, { useState } from 'react';
import { WorkflowContainer } from '@/components/ui/workflow/workflow-container';
import { WorkflowStep, WorkflowStepProps } from '@/lib/contexts/workflow-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircledIcon } from '@radix-ui/react-icons';

// Step 1: Personal Information
const PersonalInfoStep: React.FC<WorkflowStepProps> = ({ 
  stepData, 
  updateStepData,
  onNext
}) => {
  const [formData, setFormData] = useState({
    name: stepData.name || '',
    email: stepData.email || '',
    phone: stepData.phone || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStepData(formData);
    onNext();
  };

  const isValid = formData.name && formData.email;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Please provide your basic contact information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={!isValid}>
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Step 2: Preferences
const PreferencesStep: React.FC<WorkflowStepProps> = ({ 
  stepData, 
  updateStepData,
  onNext,
  onPrevious
}) => {
  const [formData, setFormData] = useState({
    communicationPreference: stepData.communicationPreference || 'email',
    interests: stepData.interests || [],
  });

  const interests = [
    { id: 'music', label: 'Music Ministry' },
    { id: 'prayer', label: 'Prayer Team' },
    { id: 'teaching', label: 'Teaching' },
    { id: 'outreach', label: 'Outreach' },
    { id: 'tech', label: 'Technology' },
  ];

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({ ...prev, communicationPreference: value }));
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData(prev => {
      const newInterests = checked
        ? [...prev.interests, id]
        : prev.interests.filter(item => item !== id);
      
      return { ...prev, interests: newInterests };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStepData(formData);
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Preferences</CardTitle>
        <CardDescription>
          Tell us how you'd like to be contacted and your areas of interest
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Preferred Communication Method</Label>
            <RadioGroup 
              value={formData.communicationPreference} 
              onValueChange={handleRadioChange}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone" />
                <Label htmlFor="phone">Phone</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="text" />
                <Label htmlFor="text">Text Message</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-3">
            <Label>Areas of Interest (Select all that apply)</Label>
            <div className="grid grid-cols-2 gap-2">
              {interests.map(interest => (
                <div key={interest.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={interest.id} 
                    checked={formData.interests.includes(interest.id)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(interest.id, checked === true)
                    }
                  />
                  <Label htmlFor={interest.id}>{interest.label}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={onPrevious}>
              Back
            </Button>
            <Button type="submit">
              Continue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Step 3: Additional Information (Conditional based on interests)
const AdditionalInfoStep: React.FC<WorkflowStepProps> = ({ 
  stepData, 
  updateStepData,
  onNext,
  onPrevious
}) => {
  const [formData, setFormData] = useState({
    experience: stepData.experience || '',
    availability: stepData.availability || [],
  });

  const availabilityOptions = [
    { id: 'weekday-morning', label: 'Weekday Mornings' },
    { id: 'weekday-evening', label: 'Weekday Evenings' },
    { id: 'weekend-morning', label: 'Weekend Mornings' },
    { id: 'weekend-evening', label: 'Weekend Evenings' },
  ];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, experience: e.target.value }));
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData(prev => {
      const newAvailability = checked
        ? [...prev.availability, id]
        : prev.availability.filter(item => item !== id);
      
      return { ...prev, availability: newAvailability };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStepData(formData);
    onNext();
  };

  // Show relevant message based on selected interests
  const getInterestMessage = () => {
    const interests = stepData.interests || [];
    if (interests.length === 0) return '';
    
    return `You've expressed interest in ${interests.map((i: string) => {
      const interest = {
        'music': 'Music Ministry',
        'prayer': 'Prayer Team',
        'teaching': 'Teaching',
        'outreach': 'Outreach',
        'tech': 'Technology'
      }[i];
      return interest || i;
    }).join(', ')}.`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Information</CardTitle>
        <CardDescription>
          {getInterestMessage()} Please tell us more about your experience and availability.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="experience">Your Experience</Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={handleTextChange}
              placeholder="Tell us about your relevant experience..."
              rows={4}
            />
          </div>
          
          <div className="space-y-3">
            <Label>Availability (Select all that apply)</Label>
            <div className="grid grid-cols-2 gap-2">
              {availabilityOptions.map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={option.id} 
                    checked={formData.availability.includes(option.id)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(option.id, checked === true)
                    }
                  />
                  <Label htmlFor={option.id}>{option.label}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={onPrevious}>
              Back
            </Button>
            <Button type="submit">
              Continue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Step 4: Confirmation
const ConfirmationStep: React.FC<WorkflowStepProps> = ({ 
  stepData, 
  onPrevious,
  isLastStep
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirmation</CardTitle>
        <CardDescription>
          Please review your information before submitting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Personal Information</h3>
            <p className="mt-1"><strong>Name:</strong> {stepData.name}</p>
            <p><strong>Email:</strong> {stepData.email}</p>
            {stepData.phone && <p><strong>Phone:</strong> {stepData.phone}</p>}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Preferences</h3>
            <p className="mt-1">
              <strong>Communication:</strong> {
                {
                  'email': 'Email',
                  'phone': 'Phone',
                  'text': 'Text Message'
                }[stepData.communicationPreference] || stepData.communicationPreference
              }
            </p>
            <p>
              <strong>Interests:</strong> {
                stepData.interests && stepData.interests.length > 0
                  ? stepData.interests.map((i: string) => {
                      return {
                        'music': 'Music Ministry',
                        'prayer': 'Prayer Team',
                        'teaching': 'Teaching',
                        'outreach': 'Outreach',
                        'tech': 'Technology'
                      }[i] || i;
                    }).join(', ')
                  : 'None selected'
              }
            </p>
          </div>
          
          {(stepData.experience || (stepData.availability && stepData.availability.length > 0)) && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Additional Information</h3>
              {stepData.experience && (
                <div className="mt-1">
                  <strong>Experience:</strong>
                  <p className="mt-1 text-sm">{stepData.experience}</p>
                </div>
              )}
              
              {stepData.availability && stepData.availability.length > 0 && (
                <div className="mt-2">
                  <strong>Availability:</strong>
                  <p className="mt-1">
                    {stepData.availability.map((a: string) => {
                      return {
                        'weekday-morning': 'Weekday Mornings',
                        'weekday-evening': 'Weekday Evenings',
                        'weekend-morning': 'Weekend Mornings',
                        'weekend-evening': 'Weekend Evenings'
                      }[a] || a;
                    }).join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900">
          <CheckCircledIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-300">Ready to submit</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-400">
            Your information is complete and ready to be submitted.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onPrevious}>
            Back
          </Button>
          <Button>
            {isLastStep ? 'Submit' : 'Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Page Component
export default function WorkflowDemoPage() {
  const [workflowComplete, setWorkflowComplete] = useState(false);
  const [submittedData, setSubmittedData] = useState<Record<string, any> | null>(null);

  // Define workflow steps
  const steps: WorkflowStep[] = [
    {
      id: 'personal-info',
      title: 'Personal Info',
      component: PersonalInfoStep,
    },
    {
      id: 'preferences',
      title: 'Preferences',
      component: PreferencesStep,
    },
    {
      id: 'additional-info',
      title: 'Additional Info',
      component: AdditionalInfoStep,
      // This step could be conditional based on selected interests
    },
    {
      id: 'confirmation',
      title: 'Confirmation',
      component: ConfirmationStep,
    }
  ];

  const handleWorkflowComplete = (data: Record<string, any>) => {
    setWorkflowComplete(true);
    setSubmittedData(data);
    console.log('Workflow completed with data:', data);
  };

  const handleReset = () => {
    setWorkflowComplete(false);
    setSubmittedData(null);
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Workflow Demo</h1>
      
      {workflowComplete ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Complete!</CardTitle>
              <CardDescription>
                Thank you for completing the workflow. Your information has been submitted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
                {JSON.stringify(submittedData, null, 2)}
              </pre>
              <Button onClick={handleReset} className="mt-4">
                Start Over
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <WorkflowContainer
          steps={steps}
          onComplete={handleWorkflowComplete}
          orientation="horizontal"
          showLabels={true}
          showProgress={true}
        />
      )}
    </div>
  );
}