'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  isOptional?: boolean;
  isCompleted?: boolean;
  isActive?: boolean;
  nextStepId?: string | ((data: Record<string, any>) => string);
  prevStepId?: string;
  component: React.ComponentType<WorkflowStepProps>;
}

export interface WorkflowStepProps {
  onNext: (data?: Record<string, any>) => void;
  onPrevious: () => void;
  onSkip?: () => void;
  isLastStep: boolean;
  isFirstStep: boolean;
  stepData: Record<string, any>;
  updateStepData: (data: Record<string, any>) => void;
}

interface WorkflowContextType {
  steps: WorkflowStep[];
  currentStepIndex: number;
  currentStep: WorkflowStep | null;
  stepData: Record<string, any>;
  progress: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToNextStep: (data?: Record<string, any>) => void;
  goToPreviousStep: () => void;
  skipStep: () => void;
  goToStep: (stepId: string) => void;
  updateStepData: (data: Record<string, any>) => void;
  completeWorkflow: () => void;
  resetWorkflow: () => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

interface WorkflowProviderProps {
  children: ReactNode;
  steps: WorkflowStep[];
  initialData?: Record<string, any>;
  onComplete?: (data: Record<string, any>) => void;
}

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({
  children,
  steps,
  initialData = {},
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>(initialData);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Initialize steps with active state
  const workflowSteps = steps.map((step, index) => ({
    ...step,
    isActive: index === 0,
    isCompleted: false,
  }));

  const currentStep = workflowSteps[currentStepIndex] || null;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === workflowSteps.length - 1;

  // Calculate progress percentage
  const progress = workflowSteps.length > 0
    ? Math.round(((completedSteps.size) / workflowSteps.length) * 100)
    : 0;

  const updateStepData = useCallback((data: Record<string, any>) => {
    setStepData(prevData => ({ ...prevData, ...data }));
  }, []);

  const markStepCompleted = useCallback((stepId: string) => {
    setCompletedSteps(prev => {
      const updated = new Set(prev);
      updated.add(stepId);
      return updated;
    });
  }, []);

  const goToNextStep = useCallback((data?: Record<string, any>) => {
    if (data) {
      updateStepData(data);
    }

    if (currentStep) {
      markStepCompleted(currentStep.id);
    }

    if (isLastStep) {
      onComplete?.(stepData);
      return;
    }

    // Determine next step (either direct or conditional)
    let nextIndex = currentStepIndex + 1;
    
    if (currentStep?.nextStepId) {
      const nextStepId = typeof currentStep.nextStepId === 'function'
        ? currentStep.nextStepId(stepData)
        : currentStep.nextStepId;
      
      const foundIndex = workflowSteps.findIndex(step => step.id === nextStepId);
      if (foundIndex !== -1) {
        nextIndex = foundIndex;
      }
    }

    setCurrentStepIndex(nextIndex);
  }, [currentStep, currentStepIndex, isLastStep, markStepCompleted, onComplete, stepData, updateStepData, workflowSteps]);

  const goToPreviousStep = useCallback(() => {
    if (isFirstStep) return;

    let prevIndex = currentStepIndex - 1;
    
    if (currentStep?.prevStepId) {
      const foundIndex = workflowSteps.findIndex(step => step.id === currentStep.prevStepId);
      if (foundIndex !== -1) {
        prevIndex = foundIndex;
      }
    }

    setCurrentStepIndex(prevIndex);
  }, [currentStep, currentStepIndex, isFirstStep, workflowSteps]);

  const skipStep = useCallback(() => {
    if (currentStep?.isOptional && !isLastStep) {
      goToNextStep();
    }
  }, [currentStep, goToNextStep, isLastStep]);

  const goToStep = useCallback((stepId: string) => {
    const stepIndex = workflowSteps.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex);
    }
  }, [workflowSteps]);

  const completeWorkflow = useCallback(() => {
    onComplete?.(stepData);
  }, [onComplete, stepData]);

  const resetWorkflow = useCallback(() => {
    setCurrentStepIndex(0);
    setStepData(initialData);
    setCompletedSteps(new Set());
  }, [initialData]);

  const value = {
    steps: workflowSteps,
    currentStepIndex,
    currentStep,
    stepData,
    progress,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
    skipStep,
    goToStep,
    updateStepData,
    completeWorkflow,
    resetWorkflow,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = (): WorkflowContextType => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};