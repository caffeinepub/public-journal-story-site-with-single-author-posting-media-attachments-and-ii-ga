import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AsyncStateProps {
  error?: Error;
  onRetry?: () => void;
}

export default function AsyncState({ error, onRetry }: AsyncStateProps) {
  if (error) {
    return (
      <div className="text-center py-20 space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-serif font-bold">Something Went Wrong</h3>
          <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return null;
}
