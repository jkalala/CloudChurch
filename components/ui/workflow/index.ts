export { default as WorkflowStepper } from './workflow-stepper';
export { default as WorkflowContent } from './workflow-content';
export { default as WorkflowContainer } from './workflow-container';
export { default as ExampleWorkflow } from './example-workflow';

// Re-export types from the context
export {
  WorkflowProvider,
  useWorkflow,
  type WorkflowStep,
  type WorkflowStepProps
} from '@/lib/contexts/workflow-context';