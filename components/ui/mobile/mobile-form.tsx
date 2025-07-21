'use client';

import React from 'react';
import { useRealTimeForm, UseRealTimeFormProps } from '@/hooks/use-real-time-form';
import { useIsMobile } from '@/hooks/use-mobile';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationContext } from '@/lib/contexts/animation-context';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface MobileFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  formProps: UseRealTimeFormProps<any>;
  onSubmit: (data: any) => void;
  className?: string;
  children: React.ReactNode;
}

/**
 * A mobile-optimized form component with real-time validation and touch-friendly inputs
 */
export function MobileForm({
  formProps,
  onSubmit,
  className,
  children,
  ...props
}: MobileFormProps) {
  const isMobile = useIsMobile();
  const { getAdjustedDuration } = useAnimationContext();
  const form = useRealTimeForm(formProps);
  
  // Handle form submission
  const handleSubmit = form.handleSubmit(onSubmit);

  // Render validation status icon
  const renderValidationIcon = (fieldName: string) => {
    const status = form.validationState[fieldName];
    
    if (!status || status === 'untouched') {
      return null;
    }
    
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: getAdjustedDuration(0.2) }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
        >
          {status === 'validating' && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {status === 'valid' && (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
          {status === 'invalid' && (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  // Clone children and add mobile-specific props
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    // Add mobile-specific classes to form elements
    if (isMobile && child.props.name) {
      const fieldName = child.props.name;
      const isVisible = form.isFieldVisible(fieldName);
      
      if (!isVisible) {
        return null;
      }
      
      // For input-like elements
      if (child.type === 'input' || child.props.className?.includes('input')) {
        return React.cloneElement(child, {
          className: cn(
            child.props.className,
            'h-12 text-base px-4',
            form.formState.errors[fieldName] ? 'pr-10 border-destructive' : '',
            form.validationState[fieldName] === 'valid' ? 'pr-10 border-green-500' : '',
            form.validationState[fieldName] === 'validating' ? 'pr-10' : ''
          ),
          ...form.registerWithValidation(fieldName, child.props.rules),
          children: (
            <>
              {child.props.children}
              {renderValidationIcon(fieldName)}
            </>
          )
        });
      }
      
      // For select elements
      if (child.type === 'select' || child.props.className?.includes('select')) {
        return React.cloneElement(child, {
          className: cn(
            child.props.className,
            'h-12 text-base',
            form.formState.errors[fieldName] ? 'border-destructive' : '',
            form.validationState[fieldName] === 'valid' ? 'border-green-500' : ''
          ),
          ...form.registerWithValidation(fieldName, child.props.rules)
        });
      }
      
      // For textarea elements
      if (child.type === 'textarea' || child.props.className?.includes('textarea')) {
        return React.cloneElement(child, {
          className: cn(
            child.props.className,
            'text-base p-4',
            form.formState.errors[fieldName] ? 'border-destructive' : '',
            form.validationState[fieldName] === 'valid' ? 'border-green-500' : ''
          ),
          ...form.registerWithValidation(fieldName, child.props.rules)
        });
      }
      
      // For other form elements
      return React.cloneElement(child, {
        ...form.registerWithValidation(fieldName, child.props.rules)
      });
    }
    
    return child;
  });

  return (
    <Form {...form}>
      <form 
        onSubmit={handleSubmit} 
        className={cn('space-y-6', isMobile && 'touch-form', className)} 
        {...props}
      >
        {enhancedChildren}
      </form>
    </Form>
  );
}

export default MobileForm;