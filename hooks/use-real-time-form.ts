'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  useForm, 
  UseFormProps, 
  UseFormReturn, 
  FieldValues, 
  FieldPath
} from 'react-hook-form';
import { useAnimationContext } from '@/lib/contexts/animation-context';

export type ValidationMode = 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';

export interface UseRealTimeFormProps<T extends FieldValues> extends UseFormProps<T> {
  validationMode?: ValidationMode;
  validationDelay?: number;
  progressiveDisclosure?: {
    [K in FieldPath<T>]?: {
      dependsOn: FieldPath<T> | FieldPath<T>[];
      condition: (values: any) => boolean;
    }
  };
}

export interface UseRealTimeFormReturn<T extends FieldValues> extends UseFormReturn<T> {
  isFieldVisible: (name: FieldPath<T>) => boolean;
  validationState: {
    [K in FieldPath<T>]?: 'valid' | 'invalid' | 'validating' | 'untouched';
  };
  touchedFields: Set<FieldPath<T>>;
  validateField: (name: FieldPath<T>) => Promise<boolean>;
  registerWithValidation: (name: FieldPath<T>, options?: any) => any;
}

/**
 * Enhanced version of useForm with real-time validation and progressive disclosure
 */
export function useRealTimeForm<
  TFieldValues extends FieldValues = FieldValues
>(
  props: UseRealTimeFormProps<TFieldValues>
): UseRealTimeFormReturn<TFieldValues> {
  const { 
    validationMode = 'onTouched', 
    validationDelay = 300,
    progressiveDisclosure = {},
    ...formProps 
  } = props;

  const { getAdjustedDuration } = useAnimationContext();
  const adjustedDelay = getAdjustedDuration(validationDelay);
  
  const [validationState, setValidationState] = useState<Record<string, 'valid' | 'invalid' | 'validating' | 'untouched'>>({});
  const [touchedFields, setTouchedFields] = useState<Set<FieldPath<TFieldValues>>>(new Set());
  const [visibleFields, setVisibleFields] = useState<Set<FieldPath<TFieldValues>>>(new Set());
  
  // Initialize form with React Hook Form
  const formMethods = useForm<TFieldValues>({
    ...formProps,
    mode: validationMode === 'onChange' ? 'onChange' : 'onTouched',
  });
  
  const { 
    register, 
    formState: { errors }, 
    trigger,
    watch,
    getValues
  } = formMethods;

  // Watch all fields for progressive disclosure
  const watchAllFields = watch();
  
  // Memoize the progressive disclosure rules to prevent unnecessary re-renders
  const disclosureRules = useMemo(() => {
    return Object.entries(progressiveDisclosure).map(([field, rule]) => ({
      field: field as FieldPath<TFieldValues>,
      dependsOn: Array.isArray(rule.dependsOn) ? rule.dependsOn : [rule.dependsOn],
      condition: rule.condition
    }));
  }, [progressiveDisclosure]);
  
  // Check if a field should be visible based on progressive disclosure rules
  const isFieldVisible = useCallback((name: FieldPath<TFieldValues>): boolean => {
    return visibleFields.has(name);
  }, [visibleFields]);
  
  // Update visible fields based on progressive disclosure rules
  useEffect(() => {
    const newVisibleFields = new Set<FieldPath<TFieldValues>>();
    const values = getValues();
    
    // All fields without progressive disclosure rules are visible by default
    Object.keys(values).forEach(field => {
      if (!progressiveDisclosure[field as FieldPath<TFieldValues>]) {
        newVisibleFields.add(field as FieldPath<TFieldValues>);
      }
    });
    
    // Check conditions for fields with progressive disclosure rules
    disclosureRules.forEach(({ field, dependsOn, condition }) => {
      // If all dependency fields are visible and the condition is met, make this field visible
      const dependenciesVisible = dependsOn.every(dep => newVisibleFields.has(dep));
      
      if (dependenciesVisible && condition(watchAllFields)) {
        newVisibleFields.add(field);
      }
    });
    
    // Only update state if the visible fields have changed
    if (JSON.stringify(Array.from(newVisibleFields)) !== JSON.stringify(Array.from(visibleFields))) {
      setVisibleFields(newVisibleFields);
    }
  }, [watchAllFields, disclosureRules, getValues, visibleFields]);

  // Custom register function that tracks touched fields
  const registerWithValidation = useCallback((name: FieldPath<TFieldValues>, options: any = {}) => {
    const registration = register(name, options);
    
    return {
      ...registration,
      onBlur: (e: any) => {
        // Mark field as touched
        setTouchedFields(prev => {
          const updated = new Set(prev);
          updated.add(name);
          return updated;
        });
        
        // Set validation state to validating
        if (validationMode === 'onBlur' || validationMode === 'onTouched' || validationMode === 'all') {
          setValidationState(prev => ({ ...prev, [name]: 'validating' }));
          
          // Trigger validation after delay
          setTimeout(() => {
            trigger(name).then(isValid => {
              setValidationState(prev => ({ 
                ...prev, 
                [name]: isValid ? 'valid' : 'invalid' 
              }));
            });
          }, adjustedDelay);
        }
        
        // Call original onBlur if provided
        options?.onBlur?.(e);
      },
      onChange: (e: any) => {
        // Set validation state to validating if using onChange mode
        if (validationMode === 'onChange' || validationMode === 'all') {
          setValidationState(prev => ({ ...prev, [name]: 'validating' }));
          
          // Trigger validation after delay
          setTimeout(() => {
            trigger(name).then(isValid => {
              setValidationState(prev => ({ 
                ...prev, 
                [name]: isValid ? 'valid' : 'invalid' 
              }));
            });
          }, adjustedDelay);
        }
        
        // Call original onChange if provided
        options?.onChange?.(e);
      }
    };
  }, [register, trigger, validationMode, adjustedDelay]);

  // Validate a specific field and update its validation state
  const validateField = useCallback(async (name: FieldPath<TFieldValues>): Promise<boolean> => {
    setValidationState(prev => ({ ...prev, [name]: 'validating' }));
    const isValid = await trigger(name);
    setValidationState(prev => ({ ...prev, [name]: isValid ? 'valid' : 'invalid' }));
    return isValid;
  }, [trigger]);

  // Update validation state based on errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setValidationState(prev => {
        const newState = { ...prev };
        
        Object.keys(errors).forEach(fieldName => {
          newState[fieldName] = 'invalid';
        });
        
        return newState;
      });
    }
  }, [errors]);

  return {
    ...formMethods,
    isFieldVisible,
    validationState,
    touchedFields,
    validateField,
    registerWithValidation,
  };
}

export default useRealTimeForm;