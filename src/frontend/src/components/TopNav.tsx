import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useAdminStatus } from '../hooks/useAdminStatus';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AuthButton from './AuthButton';
import { Home, Settings, Menu } from 'lucide-react';

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
            className="flex items-center gap-3 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            aria-label="Go to home"
          >
            <img src="/assets/generated/logo.dim_512x512.png" alt="Logo" className="h-8 w-auto" />
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Button
              variant={currentPath === '/' ? 'secondary' : 'ghost'}
              onClick={() => navigate({ to: '/' })}
              className="transition-colors"
            >
              <Home className="mr-2 h-4 w-4" />
              Stories
            </Button>
            {!isLoading && isAdmin && (
              <Button
                variant={currentPath === '/admin' ? 'secondary' : 'ghost'}
                onClick={() => navigate({ to: '/admin' })}
                className="transition-colors"
              >
                <Settings className="mr-2 h-4 w-4" />
                Admin
              </Button>
            )}
          </nav>

          {/* Mobile Navigation */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem
                onClick={() => navigate({ to: '/' })}
                className="cursor-pointer"
              >
                <Home className="mr-2 h-4 w-4" />
                Stories
              </DropdownMenuItem>
              {!isLoading && isAdmin && (
                <DropdownMenuItem
                  onClick={() => navigate({ to: '/admin' })}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Admin
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <AuthButton />
      </div>
    </header>
  );
}
