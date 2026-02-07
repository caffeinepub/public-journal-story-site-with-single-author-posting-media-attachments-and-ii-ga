import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetPost, useGetLockedPostContent } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, Calendar, ArrowLeft, LogIn } from 'lucide-react';
import AsyncState from '../components/AsyncState';
import MediaGallery from '../components/MediaGallery';
import { formatPostDateSydney } from '../utils/date';

export default function PostDetailPage() {
  const { postId } = useParams({ from: '/post/$postId' });
  const navigate = useNavigate();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: post, isLoading, error } = useGetPost(postId);
  const { data: lockedContent, isLoading: lockedLoading, error: lockedError } = useGetLockedPostContent(
    postId,
    post?.isLocked || false
  );

  const isAuthenticated = !!identity;

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-12">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Stories
        </Button>
        <Card>
          <CardHeader>
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/4 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container max-w-4xl py-12">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Stories
        </Button>
        <AsyncState
          error={error as Error || new Error('Post not found')}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const showLockedState = post.isLocked && !isAuthenticated;
  const showNotAuthorizedState = post.isLocked && isAuthenticated && lockedError;
  const displayContent = post.isLocked && lockedContent ? lockedContent : post.content;

  return (
    <div className="container max-w-4xl py-12">
      <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Stories
      </Button>

      <article>
        <Card className="overflow-hidden">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-4xl font-serif">
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
              <time>{formatPostDateSydney(post.createdAt)}</time>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {showLockedState ? (
              <div className="text-center py-16 space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted">
                  <Lock className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold">This Story is Locked</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Sign in with Internet Identity to access exclusive content.
                  </p>
                </div>
                <Button onClick={login} disabled={isLoggingIn} size="lg">
                  <LogIn className="mr-2 h-5 w-5" />
                  {isLoggingIn ? 'Signing In...' : 'Sign In to Read'}
                </Button>
              </div>
            ) : showNotAuthorizedState ? (
              <div className="text-center py-16 space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted">
                  <Lock className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold">Access Required</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    You don't have permission to view this content. Contact the author for access.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {lockedLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <div className="prose prose-lg max-w-none">
                    <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                      {displayContent}
                    </p>
                  </div>
                )}

                {post.media && post.media.length > 0 && !showLockedState && !showNotAuthorizedState && (
                  <MediaGallery media={post.media} />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </article>
    </div>
  );
}
