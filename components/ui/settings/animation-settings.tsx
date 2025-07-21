'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { 
  EnhancedFormProvider, 
  EnhancedFormField, 
  EnhancedFormMessage,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormSection,
  FeedbackIndicator,
  useRealTimeForm
} from '@/components/ui/enhanced-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useAnimationContext, AnimationPreference } from '@/lib/contexts/animation-context';
import { slideUpVariants } from '@/lib/utils/animation-variants';

// Form schema with Zod validation
const formSchema = z.object({
  preference: z.enum(['full', 'reduced', 'none']).default('full'),
  duration: z.number().min(0.1).max(1).default(0.3),
  enableAdvanced: z.boolean().default(false),
  advancedSettings: z.object({
    customEasing: z.string().optional(),
    staggerDelay: z.number().min(0).max(0.5).default(0.05),
    initialScale: z.number().min(0.5).max(1).default(0.9),
  }).optional(),
  notifications: z.object({
    enableAnimatedNotifications: z.boolean().default(true),
    notificationDuration: z.number().min(1).max(10).default(5),
    position: z.enum(['top-right', 'top-left', 'bottom-right', 'bottom-left']).default('top-right'),
  }),
  accessibility: z.object({
    reduceMotionPreference: z.boolean().default(false),
    highContrastMode: z.boolean().default(false),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function AnimationSettings() {
  const { preference, duration, setPreference, setDuration, isAnimationEnabled, getAdjustedDuration } = useAnimationContext();
  const [formStatus, setFormStatus] = React.useState<{ status: 'idle' | 'success' | 'error', message: string }>({ 
    status: 'idle', 
    message: '' 
  });
  
  // Initialize form with real-time validation
  const form = useRealTimeForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preference,
      duration,
      enableAdvanced: false,
      notifications: {
        enableAnimatedNotifications: true,
        notificationDuration: 5,
        position: 'top-right',
      },
      accessibility: {
        reduceMotionPreference: false,
        highContrastMode: false,
      },
    },
    validationMode: 'onChange',
    validationDelay: 300,
    progressiveDisclosure: {
      'advancedSettings': {
        dependsOn: 'enableAdvanced',
        condition: (values) => values.enableAdvanced === true,
      },
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      // Update animation preferences
      setPreference(data.preference as AnimationPreference);
      setDuration(data.duration);
      
      // Show success message
      setFormStatus({ 
        status: 'success', 
        message: 'Animation settings saved successfully!' 
      });
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setFormStatus({ status: 'idle', message: '' });
      }, 3000);
    } catch (error) {
      console.error('Failed to save animation settings:', error);
      setFormStatus({ 
        status: 'error', 
        message: 'Failed to save animation settings. Please try again.' 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Animation Settings</h2>
        <p className="text-muted-foreground">
          Customize how animations appear throughout the application.
        </p>
      </div>

      <EnhancedFormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Animation Preference */}
          <FormSection title="Animation Preferences" description="Control the level of animation throughout the application.">
            <EnhancedFormField
              control={form.control}
              name="preference"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Animation Level</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="full" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Full animations
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="reduced" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Reduced animations
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="none" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          No animations
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <EnhancedFormMessage />
                </FormItem>
              )}
            />

            {/* Animation Duration */}
            <EnhancedFormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Animation Duration: {field.value.toFixed(1)}s</FormLabel>
                  <FormControl>
                    <Slider
                      min={0.1}
                      max={1}
                      step={0.1}
                      value={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    Adjust how quickly animations play.
                  </FormDescription>
                  <EnhancedFormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          {/* Advanced Settings Toggle */}
          <FormSection>
            <EnhancedFormField
              control={form.control}
              name="enableAdvanced"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Advanced Settings</FormLabel>
                    <FormDescription>
                      Enable advanced animation configuration options.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </FormSection>

          {/* Advanced Settings (Progressive Disclosure) */}
          {form.isFieldVisible('advancedSettings') && (
            <FormSection title="Advanced Animation Settings" description="Fine-tune animation parameters for advanced users.">
              <EnhancedFormField
                control={form.control}
                name="advancedSettings.customEasing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Easing Function</FormLabel>
                    <FormControl>
                      <Input placeholder="cubic-bezier(0.25, 0.1, 0.25, 1.0)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a CSS easing function (e.g., cubic-bezier, ease-in-out).
                    </FormDescription>
                    <EnhancedFormMessage />
                  </FormItem>
                )}
              />

              <EnhancedFormField
                control={form.control}
                name="advancedSettings.staggerDelay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stagger Delay: {field.value.toFixed(2)}s</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={0.5}
                        step={0.01}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Delay between staggered animation elements.
                    </FormDescription>
                    <EnhancedFormMessage />
                  </FormItem>
                )}
              />

              <EnhancedFormField
                control={form.control}
                name="advancedSettings.initialScale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Scale: {field.value.toFixed(2)}</FormLabel>
                    <FormControl>
                      <Slider
                        min={0.5}
                        max={1}
                        step={0.01}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Starting scale for scale animations.
                    </FormDescription>
                    <EnhancedFormMessage />
                  </FormItem>
                )}
              />
            </FormSection>
          )}

          {/* Notification Settings */}
          <FormSection title="Notification Settings" description="Configure how notifications appear and behave.">
            <EnhancedFormField
              control={form.control}
              name="notifications.enableAnimatedNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Animated Notifications</FormLabel>
                    <FormDescription>
                      Enable animations for notifications.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <EnhancedFormField
              control={form.control}
              name="notifications.position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notification Position</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose where notifications appear on screen.
                  </FormDescription>
                  <EnhancedFormMessage />
                </FormItem>
              )}
            />

            <EnhancedFormField
              control={form.control}
              name="notifications.notificationDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration: {field.value} seconds</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    How long notifications remain visible.
                  </FormDescription>
                  <EnhancedFormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          {/* Accessibility Settings */}
          <FormSection title="Accessibility" description="Settings to improve accessibility.">
            <EnhancedFormField
              control={form.control}
              name="accessibility.reduceMotionPreference"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Respect system reduce motion preference
                    </FormLabel>
                    <FormDescription>
                      Override animation settings when system prefers reduced motion.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <EnhancedFormField
              control={form.control}
              name="accessibility.highContrastMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      High contrast mode
                    </FormLabel>
                    <FormDescription>
                      Increase contrast for better visibility.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </FormSection>

          {/* Form Status Feedback */}
          {formStatus.status !== 'idle' && (
            <FeedbackIndicator 
              status={formStatus.status === 'success' ? 'success' : 'error'} 
              messages={formStatus.message} 
            />
          )}

          {/* Submit Button */}
          <motion.div
            initial={isAnimationEnabled() ? 'hidden' : false}
            animate="visible"
            variants={slideUpVariants}
            transition={{ duration: getAdjustedDuration(0.3) }}
          >
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
              className="w-full sm:w-auto"
            >
              {form.formState.isSubmitting ? 'Saving...' : 'Save Settings'}
            </Button>
          </motion.div>
        </form>
      </EnhancedFormProvider>
    </div>
  );
}

export default AnimationSettings;