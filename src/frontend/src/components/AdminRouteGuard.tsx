import { type ReactNode } from 'react';
import { useAdminStatus } from '../hooks/useAdminStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert } from 'lucide-react';

interface AdminRouteGuardProps {
  children: ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { isAdmin, isLoading } = useAdminStatus();

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-12">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container max-w-4xl py-12">
        <div className="text-center py-16 space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-bold">Access Denied</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              You don't have permission to access this area. Only administrators can view this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
