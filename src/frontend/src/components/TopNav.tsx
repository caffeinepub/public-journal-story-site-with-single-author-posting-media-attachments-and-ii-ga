import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useAdminStatus } from '../hooks/useAdminStatus';
import { Button } from '@/components/ui/button';
import AuthButton from './AuthButton';
import { Home, Settings } from 'lucide-react';

export default function TopNav() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { isAdmin, isLoading } = useAdminStatus();
  const currentPath = routerState.location.pathname;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src="/assets/generated/logo.dim_512x512.png" alt="Logo" className="h-8 w-auto" />
          </button>
          <nav className="hidden md:flex items-center gap-2">
            <Button
              variant={currentPath === '/' ? 'secondary' : 'ghost'}
              onClick={() => navigate({ to: '/' })}
            >
              <Home className="mr-2 h-4 w-4" />
              Stories
            </Button>
            {!isLoading && isAdmin && (
              <Button
                variant={currentPath === '/admin' ? 'secondary' : 'ghost'}
                onClick={() => navigate({ to: '/admin' })}
              >
                <Settings className="mr-2 h-4 w-4" />
                Admin
              </Button>
            )}
          </nav>
        </div>
        <AuthButton />
      </div>
    </header>
  );
}
