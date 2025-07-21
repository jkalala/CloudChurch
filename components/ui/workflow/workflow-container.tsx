'use client';

import React from 'react';
import { WorkflowProvider, WorkflowStep } from '@/lib/contexts/workflow-context';
import WorkflowStepper from './workflow-stepper';
import WorkflowContent from './workflow-content';
import { cn } from '@/lib/utils';

interface WorkflowContainerProps {
  steps: WorkflowStep[];
  initialData?: Record<string, any>;
  onComplete?: (data: Record<string, any>) => void;
  className?: string;
  stepperClassName?: string;
  contentClassName?: string;
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  showProgress?: boolean;
  showNavigation?: boolean;
}

export const WorkflowContainer: React.FC<WorkflowContainerProps> = ({
  steps,
  initialData,
  onComplete,
  className,
  stepperClassName,
  contentClassName,
  orientation = 'horizontal',
  showLabels = true,
  showProgress = true,
  showNavigation = true,
}) => {
  return (
    <WorkflowProvider steps={steps} initialData={initialData} onComplete={onComplete}>
      <div className={cn('flex flex-col space-y-6', className)}>
        <WorkflowStepper 
          className={stepperClassName}
          orientation={orientation}
          showLabels={showLabels}
          showProgress={showProgress}
        />
        <WorkflowContent 
          className={contentClassName}
          showNavigation={showNavigation}
        />
      </div>
    </WorkflowProvider>
  );
};

export default WorkflowContainer;