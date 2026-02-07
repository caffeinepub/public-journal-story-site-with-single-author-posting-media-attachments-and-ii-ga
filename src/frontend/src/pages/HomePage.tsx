import { useNavigate } from '@tanstack/react-router';
import { useGetAllPosts } from '../hooks/useQueries';
import { useAdminStatus } from '../hooks/useAdminStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, Calendar, Plus } from 'lucide-react';
import AsyncState from '../components/AsyncState';

export default function HomePage() {
  const navigate = useNavigate();
  const { data: posts, isLoading, error } = useGetAllPosts();
  const { isAdmin, isLoading: adminLoading } = useAdminStatus();

  const sortedPosts = posts ? [...posts].sort((a, b) => Number(b.createdAt - a.createdAt)) : [];

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-12">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/4 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-12">
        <AsyncState
          error={error as Error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="container max-w-4xl py-12">
        <div className="text-center py-16">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-4">No Stories Yet</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            The journal is empty. Check back soon for new stories and reflections.
          </p>
          {!adminLoading && isAdmin && (
            <Button onClick={() => navigate({ to: '/admin' })} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Post
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-12">
      <div className="space-y-8">
        {sortedPosts.map((post) => (
          <Card
            key={post.id.toString()}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => navigate({ to: '/post/$postId', params: { postId: post.id.toString() } })}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-2xl font-serif group-hover:text-primary transition-colors">
                  {post.title || 'Untitled Entry'}
                </CardTitle>
                {post.isLocked && (
                  <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                    <Lock className="h-3 w-3" />
                    Locked
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <time>{new Date(Number(post.createdAt) * 1000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</time>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-3">
                {post.content.substring(0, 200)}
                {post.content.length > 200 && '...'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
