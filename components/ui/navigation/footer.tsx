'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface FooterProps {
  className?: string;
  minimal?: boolean;
}

export function Footer({ className, minimal = false }: FooterProps) {
  const isMobile = useIsMobile();
  const currentYear = new Date().getFullYear();
  
  // Minimal footer for pages where space is limited
  if (minimal) {
    return (
      <footer className={cn('border-t bg-background', className)}>
        <div className="container py-4 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Connectus. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground">
              Help
            </Link>
          </div>
        </div>
      </footer>
    );
  }
  
  // Full footer with all sections
  return (
    <footer className={cn('border-t bg-background', className)}>
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary">
                <span className="text-primary-foreground font-bold">C</span>
              </div>
              <span className="font-bold text-xl">Connectus</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Modern church management software to help your ministry thrive in the digital age.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-medium">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Members', href: '/members' },
                { title: 'Events', href: '/events' },
                { title: 'Pastoral Care', href: '/pastoral-care' },
                { title: 'Finances', href: '/finances' },
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center"
                  >
                    <ArrowRight className="h-3 w-3 mr-2" />
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-medium">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  123 Church Street, Anytown, CA 12345
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  (555) 123-4567
                </span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  info@connectus-church.com
                </span>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-medium">Newsletter</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter to receive updates and news.
            </p>
            <div className="flex space-x-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="max-w-[220px]" 
              />
              <Button>
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="container py-6 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Connectus. All rights reserved.
        </p>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
            Terms of Service
          </Link>
          <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground">
            Help Center
          </Link>
        </div>
        <div className="flex items-center mt-4 md:mt-0 text-sm text-muted-foreground">
          <span>Made with</span>
          <Heart className="h-3 w-3 mx-1 text-red-500" />
          <span>by Connectus Team</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;