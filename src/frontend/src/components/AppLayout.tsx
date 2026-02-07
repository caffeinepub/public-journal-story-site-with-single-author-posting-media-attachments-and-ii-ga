import { type ReactNode } from 'react';
import TopNav from './TopNav';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background bg-paper-texture">
        <TopNav />
        <main className="pb-16">{children}</main>
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container py-8 text-center text-sm text-muted-foreground">
            <p>© 2026. Built with ❤️ using <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">caffeine.ai</a></p>
          </div>
        </footer>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
