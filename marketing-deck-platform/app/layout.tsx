import './globals.css';
import { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/lib/auth/auth-context';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { EventTracker } from '@/components/analytics/EventTracker';

export const metadata: Metadata = {
  title: 'EasyDecks.ai - AI-Powered Presentation Platform',
  description: 'Transform your data into stunning executive presentations with AI',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gray-950 text-white antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <EventTracker>
              {children}
            </EventTracker>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
