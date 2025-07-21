'use client';

import React from 'react';
import { useWorkflow, WorkflowStep } from '@/lib/contexts/workflow-context';
import { cn } from '@/lib/utils';
import { CheckIcon, ChevronRightIcon } from '@radix-ui/react-icons';

interface WorkflowStepperProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  showProgress?: boolean;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  className,
  orientation = 'horizontal',
  showLabels = true,
  showProgress = true,
}) => {
  const { steps, currentStepIndex, progress, goToStep } = useWorkflow();

  const handleStepClick = (step: WorkflowStep, index: number) => {
    // Only allow clicking on completed steps or the next available step
    if (step.isCompleted || index === currentStepIndex + 1) {
      goToStep(step.id);
    }
  };

  return (
    <div className={cn(
      'w-full',
      orientation === 'vertical' ? 'flex flex-col space-y-4' : 'flex flex-col',
      className
    )}>
      {showProgress && (
        <div className="w-full mb-4">
          <div className="flex justify-between mb-1 text-sm">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col space-y-4' : 'flex-row'
      )}>
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = step.isCompleted;
          const isClickable = isCompleted || index === currentStepIndex + 1;

          return (
            <React.Fragment key={step.id}>
              <div 
                className={cn(
                  'flex items-center',
                  orientation === 'horizontal' ? 'flex-col' : 'flex-row',
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed',
                  'group'
                )}
                onClick={() => handleStepClick(step, index)}
              >
                <div 
                  className={cn(
                    'rounded-full flex items-center justify-center transition-all duration-200',
                    'w-10 h-10 border-2',
                    isActive ? 'border-primary bg-primary/10 text-primary' : 
                    isCompleted ? 'border-primary bg-primary text-white' : 
                    'border-gray-300 bg-gray-100 text-gray-400 dark:border-gray-600 dark:bg-gray-800',
                    isClickable && !isActive && !isCompleted && 'group-hover:border-gray-400 group-hover:text-gray-600'
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                
                {showLabels && (
                  <div 
                    className={cn(
                      'text-sm mt-2',
                      orientation === 'horizontal' ? 'text-center' : 'ml-3',
                      isActive ? 'text-primary font-medium' : 
                      isCompleted ? 'text-gray-700 dark:text-gray-300' : 
                      'text-gray-400 dark:text-gray-500'
                    )}
                  >
                    {step.title}
                    {step.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {step.description}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    'flex-grow',
                    orientation === 'horizontal' ? 'flex items-center justify-center mx-2' : 'ml-5 my-1 border-l-2 h-6',
                    steps[index].isCompleted ? 'border-primary' : 'border-gray-300 dark:border-gray-700'
                  )}
                >
                  {orientation === 'horizontal' && (
                    <div className={cn(
                      'h-0.5 w-full',
                      steps[index].isCompleted ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
                    )}></div>
                  )}
                  {orientation === 'vertical' && steps[index].isCompleted && (
                    <ChevronRightIcon className="w-4 h-4 text-primary -ml-2" />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowStepper;