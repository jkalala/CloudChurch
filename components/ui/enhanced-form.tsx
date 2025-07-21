'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FieldPath, 
  FieldValues,
  Controller,
  ControllerProps,
  FormProvider,
} from 'react-hook-form';
import { cn } from '@/lib/utils';
import { useAnimationContext } from '@/lib/contexts/animation-context';
import { 
  fadeVariants, 
  slideUpVariants, 
  popVariants 
} from '@/lib/utils/animation-variants';
import { 
  Form as BaseForm,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useRealTimeForm, UseRealTimeFormReturn } from '@/hooks/use-real-time-form';

// Re-export the base form components
export { FormItem, FormLabel, FormControl, FormDescription };

// Enhanced Form Provider
export const EnhancedForm = FormProvider;

// Enhanced Form Field with animation and real-time validation
export const EnhancedFormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  render,
  ...props
}: ControllerProps<TFieldValues, TName> & {
  showValidationStatus?: boolean;
}) => {
  const { isAnimationEnabled, getAdjustedDuration } = useAnimationContext();
  const formContext = React.useContext(EnhancedFormContext);
  
  if (!formContext) {
    throw new Error('EnhancedFormField must be used within an EnhancedFormProvider');
  }
  
  const { validationState, isFieldVisible } = formContext;
  const fieldValidationState = validationState[name];
  const visible = isFieldVisible(name);
  
  if (!visible) {
    return null;
  }
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={name}
        initial={isAnimationEnabled() ? 'hidden' : false}
        animate="visible"
        exit="exit"
        variants={slideUpVariants}
        transition={{ duration: getAdjustedDuration(0.2) }}
      >
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValue}
          rules={rules}
          shouldUnregister={shouldUnregister}
          render={({ field, fieldState }) => (
            <div className="relative">
              {render({ field, fieldState })}
              
              {props.showValidationStatus !== false && fieldValidationState && (
                <AnimatePresence mode="wait">
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    {fieldValidationState === 'validating' && (
                      <motion.div
                        key="validating"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: getAdjustedDuration(0.2) }}
                      >
                        <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                      </motion.div>
                    )}
                    
                    {fieldValidationState === 'valid' && (
                      <motion.div
                        key="valid"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: getAdjustedDuration(0.2) }}
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </motion.div>
                    )}
                    
                    {fieldValidationState === 'invalid' && (
                      <motion.div
                        key="invalid"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: getAdjustedDuration(0.2) }}
                      >
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      </motion.div>
                    )}
                  </div>
                </AnimatePresence>
              )}
            </div>
          )}
          {...props}
        />
      </motion.div>
    </AnimatePresence>
  );
};

// Enhanced Form Message with animation
export const EnhancedFormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { isAnimationEnabled, getAdjustedDuration } = useAnimationContext();
  
  if (!children) {
    return null;
  }
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={isAnimationEnabled() ? 'hidden' : false}
        animate="visible"
        exit="exit"
        variants={slideUpVariants}
        transition={{ duration: getAdjustedDuration(0.2) }}
      >
        <FormMessage
          ref={ref}
          className={cn(className)}
          {...props}
        >
          {children}
        </FormMessage>
      </motion.div>
    </AnimatePresence>
  );
});
EnhancedFormMessage.displayName = 'EnhancedFormMessage';

// Create a context for the enhanced form
type EnhancedFormContextType<TFieldValues extends FieldValues = FieldValues> = 
  Pick<UseRealTimeFormReturn<TFieldValues>, 'validationState' | 'isFieldVisible'>;

const EnhancedFormContext = React.createContext<EnhancedFormContextType | null>(null);

// Enhanced Form Provider that includes the real-time validation context
export function EnhancedFormProvider<
  TFieldValues extends FieldValues = FieldValues
>({ 
  children, 
  ...formMethods 
}: { 
  children: React.ReactNode 
} & UseRealTimeFormReturn<TFieldValues>) {
  const { validationState, isFieldVisible } = formMethods;
  
  return (
    <EnhancedFormContext.Provider value={{ validationState, isFieldVisible }}>
      <FormProvider {...formMethods}>
        {children}
      </FormProvider>
    </EnhancedFormContext.Provider>
  );
}

// Section component for progressive disclosure
export const FormSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
    description?: string;
    condition?: boolean;
  }
>(({ className, title, description, condition = true, children, ...props }, ref) => {
  const { isAnimationEnabled, getAdjustedDuration } = useAnimationContext();
  
  if (!condition) {
    return null;
  }
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={ref}
        className={cn("space-y-4 rounded-lg border p-4", className)}
        initial={isAnimationEnabled() ? 'hidden' : false}
        animate="visible"
        exit="exit"
        variants={fadeVariants}
        transition={{ duration: getAdjustedDuration(0.3) }}
        {...props}
      >
        {title && (
          <h3 className="text-lg font-medium">{title}</h3>
        )}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <div className="space-y-4">
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
FormSection.displayName = 'FormSection';

// Feedback indicator component
export const FeedbackIndicator = ({ 
  status, 
  messages 
}: { 
  status: 'success' | 'error' | 'info' | 'warning',
  messages: string | string[]
}) => {
  const { isAnimationEnabled, getAdjustedDuration } = useAnimationContext();
  const messageArray = Array.isArray(messages) ? messages : [messages];
  
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };
  
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <AlertCircle className="h-5 w-5 text-blue-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  };
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={isAnimationEnabled() ? 'hidden' : false}
        animate="visible"
        exit="exit"
        variants={popVariants}
        transition={{ duration: getAdjustedDuration(0.3) }}
        className={cn(
          'rounded-md border p-3 flex items-start gap-2',
          colors[status]
        )}
      >
        <div className="flex-shrink-0 mt-0.5">
          {icons[status]}
        </div>
        <div>
          {messageArray.map((message, index) => (
            <p key={index} className="text-sm">
              {message}
            </p>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export {
  BaseForm as Form,
  useRealTimeForm,
};