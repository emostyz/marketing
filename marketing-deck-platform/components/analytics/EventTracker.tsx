'use client';

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

interface EventTrackerProps {
  children: React.ReactNode;
}

export function EventTracker({ children }: EventTrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Log page view
  const logPageView = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics/page-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: pathname,
          search: searchParams.toString(),
          user_id: user?.id || null,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error('Failed to log page view');
      }
    } catch (error) {
      console.error('Error logging page view:', error);
    }
  }, [pathname, searchParams, user?.id]);

  // Log user interaction
  const logUserInteraction = useCallback(async (
    eventType: string,
    eventData: any,
    elementId?: string
  ) => {
    try {
      const response = await fetch('/api/analytics/user-interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: eventType,
          event_data: eventData,
          element_id: elementId,
          path: pathname,
          user_id: user?.id || null,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error('Failed to log user interaction');
      }
    } catch (error) {
      console.error('Error logging user interaction:', error);
    }
  }, [pathname, user?.id]);

  // Log page view on route change
  useEffect(() => {
    logPageView();
  }, [logPageView]);

  // Add global event listeners for user interactions
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const elementId = target.id || target.className || target.tagName;
      
      // Log button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        logUserInteraction('button_click', {
          text: target.textContent?.trim(),
          element_id: elementId,
        }, elementId);
      }
      
      // Log link clicks
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? target as HTMLAnchorElement : target.closest('a') as HTMLAnchorElement;
        logUserInteraction('link_click', {
          href: link?.href || 'unknown',
          text: link?.textContent?.trim(),
          element_id: elementId,
        }, elementId);
      }
      
      // Log form interactions
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        logUserInteraction('form_interaction', {
          type: target.tagName.toLowerCase(),
          name: (target as HTMLInputElement).name,
          value: (target as HTMLInputElement).value?.substring(0, 100), // Truncate for privacy
          element_id: elementId,
        }, elementId);
      }
    };

    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement;
      const scrollTop = target.scrollTop || window.scrollY;
      const scrollHeight = target.scrollHeight || document.documentElement.scrollHeight;
      const scrollPercentage = Math.round((scrollTop / (scrollHeight - window.innerHeight)) * 100);
      
      // Log scroll events every 25% of the page
      if (scrollPercentage % 25 === 0) {
        logUserInteraction('scroll', {
          percentage: scrollPercentage,
          path: pathname,
        });
      }
    };

    const handleFormSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);
      const formFields: Record<string, string> = {};
      
      // Collect form field names (not values for privacy)
      for (const [key] of formData.entries()) {
        formFields[key] = 'filled';
      }
      
      logUserInteraction('form_submit', {
        form_id: form.id || form.className,
        field_count: Object.keys(formFields).length,
        fields: formFields,
      }, form.id);
    };

    // Add event listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('submit', handleFormSubmit);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('submit', handleFormSubmit);
    };
  }, [logUserInteraction, pathname]);

  return <>{children}</>;
} 