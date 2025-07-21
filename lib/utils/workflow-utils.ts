import { WorkflowStep } from '@/lib/contexts/workflow-context';

/**
 * Creates a conditional path between workflow steps
 * 
 * @param steps Array of workflow steps
 * @param fromStepId ID of the source step
 * @param toStepId ID of the destination step
 * @param condition Function that evaluates whether to take this path
 * @returns Updated array of workflow steps
 */
export function createConditionalPath(
  steps: WorkflowStep[],
  fromStepId: string,
  toStepId: string,
  condition: (data: Record<string, any>) => boolean
): WorkflowStep[] {
  return steps.map(step => {
    if (step.id === fromStepId) {
      return {
        ...step,
        nextStepId: (data: Record<string, any>) => {
          if (condition(data)) {
            return toStepId;
          }
          
          // Find the current step index and return the next step's id
          const currentIndex = steps.findIndex(s => s.id === fromStepId);
          if (currentIndex >= 0 && currentIndex < steps.length - 1) {
            return steps[currentIndex + 1].id;
          }
          
          return toStepId;
        }
      };
    }
    return step;
  });
}

/**
 * Creates a workflow step with the given properties
 * 
 * @param id Unique identifier for the step
 * @param title Display title for the step
 * @param component React component to render for this step
 * @param options Additional options for the step
 * @returns A workflow step object
 */
export function createWorkflowStep(
  id: string,
  title: string,
  component: React.ComponentType<any>,
  options?: {
    description?: string;
    isOptional?: boolean;
    nextStepId?: string | ((data: Record<string, any>) => string);
    prevStepId?: string;
  }
): WorkflowStep {
  return {
    id,
    title,
    component,
    ...options
  };
}

/**
 * Validates if a workflow has all required steps and connections
 * 
 * @param steps Array of workflow steps
 * @returns Object with validation result and any errors
 */
export function validateWorkflow(steps: WorkflowStep[]): { 
  valid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];
  
  // Check for duplicate IDs
  const ids = steps.map(step => step.id);
  const uniqueIds = new Set(ids);
  
  if (uniqueIds.size !== steps.length) {
    errors.push('Workflow contains duplicate step IDs');
  }
  
  // Check that all steps have components
  steps.forEach(step => {
    if (!step.component) {
      errors.push(`Step "${step.id}" is missing a component`);
    }
  });
  
  // Check that nextStepId references exist
  steps.forEach(step => {
    if (typeof step.nextStepId === 'string') {
      const nextStepExists = steps.some(s => s.id === step.nextStepId);
      if (!nextStepExists) {
        errors.push(`Step "${step.id}" references non-existent nextStepId "${step.nextStepId}"`);
      }
    }
  });
  
  // Check that prevStepId references exist
  steps.forEach(step => {
    if (step.prevStepId) {
      const prevStepExists = steps.some(s => s.id === step.prevStepId);
      if (!prevStepExists) {
        errors.push(`Step "${step.id}" references non-existent prevStepId "${step.prevStepId}"`);
      }
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}