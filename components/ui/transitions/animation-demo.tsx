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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnimationContext } from '@/lib/contexts/animation-context';
import { slideUpVariants, fadeVariants } from '@/lib/utils/animation-variants';

// Form schema with Zod validation
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
  urgent: z.boolean().default(false),
  urgencyDetails: z.string().optional(),
  preferredContact: z.enum(['email', 'phone', 'any']).default('email'),
  phoneNumber: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function AnimationDemo() {
  const { isAnimationEnabled, getAdjustedDuration } = useAnimationContext();
  const [activeTab, setActiveTab] = React.useState('form');
  const [formStatus, setFormStatus] = React.useState<{ status: 'idle' | 'success' | 'error', message: string }>({ 
    status: 'idle', 
    message: '' 
  });
  
  // Initialize form with real-time validation
  const form = useRealTimeForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      urgent: false,
      preferredContact: 'email',
    },
    validationMode: 'onChange',
    validationDelay: 300,
    progressiveDisclosure: {
      'urgencyDetails': {
        dependsOn: 'urgent',
        condition: (values) => values.urgent === true,
      },
      'phoneNumber': {
        dependsOn: 'preferredContact',
        condition: (values) => values.preferredContact === 'phone' || values.preferredContact === 'any',
      },
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: ContactFormValues) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Form submitted:', data);
      
      // Show success message
      setFormStatus({ 
        status: 'success', 
        message: 'Your message has been sent successfully! We will get back to you soon.' 
      });
      
      // Reset form after successful submission
      form.reset();
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setFormStatus({ status: 'idle', message: '' });
      }, 5000);
    } catch (error) {
      console.error('Failed to submit form:', error);
      setFormStatus({ 
        status: 'error', 
        message: 'Failed to send your message. Please try again.' 
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Animation & Form Demo</CardTitle>
        <CardDescription>
          This demo showcases real-time form validation with animated feedback.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Contact Form</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          <TabsContent value="form">
            <EnhancedFormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                <FormSection>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name Field */}
                    <EnhancedFormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <EnhancedFormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email Field */}
                    <EnhancedFormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <EnhancedFormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Subject Field */}
                  <EnhancedFormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Message subject" {...field} />
                        </FormControl>
                        <EnhancedFormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Message Field */}
                  <EnhancedFormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Type your message here..." 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <EnhancedFormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Preferred Contact Method */}
                  <EnhancedFormField
                    control={form.control}
                    name="preferredContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Contact Method</FormLabel>
                        <FormControl>
                          <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            {...field}
                          >
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="any">Either</option>
                          </select>
                        </FormControl>
                        <FormDescription>
                          How would you like us to contact you?
                        </FormDescription>
                        <EnhancedFormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone Number (Progressive Disclosure) */}
                  <EnhancedFormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Only used if you selected phone as contact method.
                        </FormDescription>
                        <EnhancedFormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Urgent Toggle */}
                  <EnhancedFormField
                    control={form.control}
                    name="urgent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Urgent Request</FormLabel>
                          <FormDescription>
                            Mark this message as urgent if it requires immediate attention.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Urgency Details (Progressive Disclosure) */}
                  <EnhancedFormField
                    control={form.control}
                    name="urgencyDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urgency Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please explain why this request is urgent..." 
                            className="min-h-[80px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Provide details about why this request is urgent.
                        </FormDescription>
                        <EnhancedFormMessage />
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
                  className="flex justify-end"
                >
                  <Button 
                    type="submit" 
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </motion.div>
              </form>
            </EnhancedFormProvider>
          </TabsContent>
          <TabsContent value="about">
            <motion.div
              initial={isAnimationEnabled() ? 'hidden' : false}
              animate="visible"
              variants={fadeVariants}
              transition={{ duration: getAdjustedDuration(0.3) }}
              className="space-y-4 py-4"
            >
              <h3 className="text-lg font-medium">About This Demo</h3>
              <p>
                This demo showcases the enhanced form system with real-time validation and animated feedback indicators.
                Key features include:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Real-time field validation with visual feedback</li>
                <li>Progressive disclosure of form fields based on user input</li>
                <li>Animated transitions between form states</li>
                <li>Accessible form controls with proper ARIA attributes</li>
                <li>Responsive layout that works on all devices</li>
                <li>Form submission handling with success/error feedback</li>
              </ul>
              <p>
                The form system is built on top of React Hook Form with Zod validation and enhanced with
                Framer Motion animations that respect user animation preferences.
              </p>
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          All fields with * are required
        </p>
      </CardFooter>
    </Card>
  );
}

export default AnimationDemo;