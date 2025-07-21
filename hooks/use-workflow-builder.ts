'use client';

import { useState, useCallback } from 'react';
import { WorkflowStep } from '@/lib/contexts/workflow-context';

interface UseWorkflowBuilderOptions {
  onComplete?: (data: Record<string, any>) => void;
}

export const useWorkflowBuilder = (options?: UseWorkflowBuilderOptions) => {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [initialData, setInitialData] = useState<Record<string, any>>({});

  const addStep = useCallback((step: WorkflowStep) => {
    setSteps(prevSteps => [...prevSteps, step]);
    return step.id;
  }, []);

  const removeStep = useCallback((stepId: string) => {
    setSteps(prevSteps => prevSteps.filter(step => step.id !== stepId));
  }, []);

  const updateStep = useCallback((stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    );
  }, []);

  const setStepOrder = useCallback((stepIds: string[]) => {
    setSteps(prevSteps => {
      const stepMap = new Map(prevSteps.map(step => [step.id, step]));
      return stepIds
        .map(id => stepMap.get(id))
        .filter((step): step is WorkflowStep => step !== undefined);
    });
  }, []);

  const addConditionalPath = useCallback((
    fromStepId: string, 
    toStepId: string, 
    condition?: (data: Record<string, any>) => boolean
  ) => {
    setSteps(prevSteps => 
      prevSteps.map(step => {
        if (step.id === fromStepId) {
          if (condition) {
            // If condition is provided, create a function that evaluates the condition
            // and returns either the toStepId or the next step in sequence
            const nextStepId = (data: Record<string, any>) => {
              if (condition(data)) {
                return toStepId;
              }
              
              // Find the current step index and return the next step's id
              const currentIndex = prevSteps.findIndex(s => s.id === fromStepId);
              if (currentIndex >= 0 && currentIndex < prevSteps.length - 1) {
                return prevSteps[currentIndex + 1].id;
              }
              
              return toStepId;
            };
            
            return { ...step, nextStepId };
          }
          
          // If no condition, just set the direct path
          return { ...step, nextStepId: toStepId };
        }
        return step;
      })
    );
  }, []);

  const setInitialWorkflowData = useCallback((data: Record<string, any>) => {
    setInitialData(data);
  }, []);

  return {
    steps,
    initialData,
    addStep,
    removeStep,
    updateStep,
    setStepOrder,
    addConditionalPath,
    setInitialWorkflowData,
    onComplete: options?.onComplete,
  };
};

export default useWorkflowBuilder;