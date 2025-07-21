'use client';

import React from 'react';
import { useWorkflow } from '@/lib/contexts/workflow-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface WorkflowContentProps {
  className?: string;
  showNavigation?: boolean;
  nextButtonText?: string;
  prevButtonText?: string;
  skipButtonText?: string;
  completeButtonText?: string;
}

export const WorkflowContent: React.FC<WorkflowContentProps> = ({
  className,
  showNavigation = true,
  nextButtonText = 'Next',
  prevButtonText = 'Back',
  skipButtonText = 'Skip',
  completeButtonText = 'Complete',
}) => {
  const {
    currentStep,
    stepData,
    updateStepData,
    goToNextStep,
    goToPreviousStep,
    skipStep,
    isFirstStep,
    isLastStep,
  } = useWorkflow();

  if (!currentStep) {
    return <div className="p-4 text-center text-gray-500">No steps defined</div>;
  }

  const StepComponent = currentStep.component;

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex-grow">
        <StepComponent
          onNext={goToNextStep}
          onPrevious={goToPreviousStep}
          onSkip={currentStep.isOptional ? skipStep : undefined}
          isLastStep={isLastStep}
          isFirstStep={isFirstStep}
          stepData={stepData}
          updateStepData={updateStepData}
        />
      </div>

      {showNavigation && (
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            {!isFirstStep && (
              <Button
                variant="outline"
                onClick={goToPreviousStep}
              >
                {prevButtonText}
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            {currentStep.isOptional && (
              <Button
                variant="ghost"
                onClick={skipStep}
              >
                {skipButtonText}
              </Button>
            )}
            
            <Button
              onClick={() => goToNextStep()}
            >
              {isLastStep ? completeButtonText : nextButtonText}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowContent;