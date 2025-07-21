import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useWorkflowBuilder } from '@/hooks/use-workflow-builder';
import { WorkflowProvider, WorkflowStepProps } from '@/lib/contexts/workflow-context';
import { WorkflowContainer } from '@/components/ui/workflow/workflow-container';
import { createWorkflowStep, validateWorkflow } from '@/lib/utils/workflow-utils';

// Mock step components
const Step1 = ({ onNext, stepData, updateStepData }: WorkflowStepProps) => (
  <div>
    <h2>Step 1</h2>
    <input 
      data-testid="step1-input" 
      value={stepData.name || ''} 
      onChange={(e) => updateStepData({ name: e.target.value })} 
    />
    <button onClick={() => onNext()}>Next</button>
  </div>
);

const Step2 = ({ onNext, onPrevious, stepData }: WorkflowStepProps) => (
  <div>
    <h2>Step 2</h2>
    <p>Hello, {stepData.name || 'User'}</p>
    <button onClick={onPrevious}>Back</button>
    <button onClick={() => onNext()}>Next</button>
  </div>
);

const Step3 = ({ onPrevious, isLastStep }: WorkflowStepProps) => (
  <div>
    <h2>Step 3</h2>
    <button onClick={onPrevious}>Back</button>
    <button>{isLastStep ? 'Complete' : 'Next'}</button>
  </div>
);

// Test component that uses the workflow builder
const TestWorkflow = ({ onComplete }: { onComplete?: (data: Record<string, any>) => void }) => {
  const { steps, initialData } = useWorkflowBuilder({ onComplete });
  
  // Define steps
  const workflowSteps = [
    createWorkflowStep('step1', 'Personal Info', Step1),
    createWorkflowStep('step2', 'Confirmation', Step2),
    createWorkflowStep('step3', 'Complete', Step3)
  ];
  
  return (
    <WorkflowContainer 
      steps={workflowSteps}
      initialData={initialData}
      onComplete={onComplete}
    />
  );
};

describe('Workflow Builder', () => {
  test('renders workflow with initial step', () => {
    render(<TestWorkflow />);
    expect(screen.getByText('Step 1')).toBeInTheDocument();
  });
  
  test('navigates between steps', () => {
    render(<TestWorkflow />);
    
    // Should start at step 1
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    
    // Navigate to step 2
    const nextButtons = screen.getAllByText('Next');
    fireEvent.click(nextButtons[nextButtons.length - 1]);
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    
    // Navigate back to step 1
    const backButtons = screen.getAllByText('Back');
    fireEvent.click(backButtons[backButtons.length - 1]);
    expect(screen.getByText('Step 1')).toBeInTheDocument();
  });
  
  test('passes data between steps', () => {
    render(<TestWorkflow />);
    
    // Enter name in step 1
    fireEvent.change(screen.getByTestId('step1-input'), { target: { value: 'John Doe' } });
    
    // Navigate to step 2
    const nextButtons = screen.getAllByText('Next');
    fireEvent.click(nextButtons[nextButtons.length - 1]);
    
    // Check if name is displayed in step 2
    expect(screen.getByText('Hello, John Doe')).toBeInTheDocument();
  });
  
  test('validates workflow steps', () => {
    const validSteps = [
      createWorkflowStep('step1', 'Step 1', Step1),
      createWorkflowStep('step2', 'Step 2', Step2),
      createWorkflowStep('step3', 'Step 3', Step3)
    ];
    
    const invalidSteps = [
      createWorkflowStep('step1', 'Step 1', Step1),
      createWorkflowStep('step1', 'Duplicate ID', Step2), // Duplicate ID
      createWorkflowStep('step3', 'Step 3', Step3, { nextStepId: 'non-existent' }) // Invalid nextStepId
    ];
    
    const validResult = validateWorkflow(validSteps);
    const invalidResult = validateWorkflow(invalidSteps);
    
    expect(validResult.valid).toBe(true);
    expect(validResult.errors.length).toBe(0);
    
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });
});