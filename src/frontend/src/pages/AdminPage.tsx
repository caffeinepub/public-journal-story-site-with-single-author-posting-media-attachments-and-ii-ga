import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllPosts, useCreatePost, useUpdatePost, useDeletePost, useUpdatePostTimestamp } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Lock, Unlock, Eye, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import AllowlistManager from '../components/AllowlistManager';
import MediaUploader from '../components/MediaUploader';
import AsyncState from '../components/AsyncState';
import { formatPostDateSydney } from '../utils/date';
import type { Post } from '../backend';

export default function AdminPage() {
  const navigate = useNavigate();
  const { data: posts, isLoading, error } = useGetAllPosts();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();
  const updateTimestamp = useUpdatePostTimestamp();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isLocked: false,
  });
  const [formErrors, setFormErrors] = useState<{ title?: string; content?: string }>({});

  const sortedPosts = posts ? [...posts].sort((a, b) => Number(b.createdAt - a.createdAt)) : [];

  const validateForm = () => {
    const errors: { title?: string; content?: string } = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingPost) {
        await updatePost.mutateAsync({
          postId: editingPost.id,
          title: formData.title,
          content: formData.content,
          isLocked: formData.isLocked,
        });
        toast.success('Post updated successfully');
        setEditingPost(null);
      } else {
        await createPost.mutateAsync({
          title: formData.title,
          content: formData.content,
          isLocked: formData.isLocked,
        });
        toast.success('Post created successfully');
        setIsCreateDialogOpen(false);
      }
      setFormData({ title: '', content: '', isLocked: false });
      setFormErrors({});
    } catch (error: any) {
      toast.error(error.message || 'Failed to save post');
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      isLocked: post.isLocked,
    });
  };

  const handleDelete = async (postId: bigint) => {
    try {
      await deletePost.mutateAsync(postId);
      toast.success('Post deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete post');
    }
  };

  const handleUpdateTimestamp = async (postId: bigint) => {
    try {
      await updateTimestamp.mutateAsync(postId);
      toast.success('Post date updated to today');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update timestamp');
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-12 space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-2/3" />
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
      <div className="container max-w-5xl py-12">
        <AsyncState
          error={error as Error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-12 space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your journal posts and access control</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">Create New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter post title"
                  className={formErrors.title ? 'border-destructive' : ''}
                />
                {formErrors.title && (
                  <p className="text-sm text-destructive">{formErrors.title}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your story..."
                  rows={12}
                  className={formErrors.content ? 'border-destructive' : ''}
                />
                {formErrors.content && (
                  <p className="text-sm text-destructive">{formErrors.content}</p>
                )}
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="space-y-0.5">
                  <Label htmlFor="locked" className="text-base">Lock Content</Label>
                  <p className="text-sm text-muted-foreground">
                    Require authentication to view this post
                  </p>
                </div>
                <Switch
                  id="locked"
                  checked={formData.isLocked}
                  onCheckedChange={(checked) => setFormData({ ...formData, isLocked: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setFormData({ title: '', content: '', isLocked: false });
                  setFormErrors({});
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={createPost.isPending}>
                {createPost.isPending ? 'Creating...' : 'Create Post'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-serif font-semibold">Your Posts</h2>
          {!posts || posts.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground">No posts yet. Create your first post to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedPosts.map((post) => (
                <Card key={post.id.toString()} className="overflow-hidden border-border/50">
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <CardTitle className="text-xl md:text-2xl font-serif">
                            {post.title || 'Untitled Entry'}
                          </CardTitle>
                          {post.isLocked ? (
                            <Badge variant="secondary" className="flex items-center gap-1.5">
                              <Lock className="h-3 w-3" />
                              Locked
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1.5">
                              <Unlock className="h-3 w-3" />
                              Public
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <time>{formatPostDateSydney(post.createdAt)}</time>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate({ to: '/post/$postId', params: { postId: post.id.toString() } })}
                          title="View post"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdateTimestamp(post.id)}
                          disabled={updateTimestamp.isPending}
                          title="Update date to today"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Dialog
                          open={editingPost?.id === post.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setEditingPost(null);
                              setFormData({ title: '', content: '', isLocked: false });
                              setFormErrors({});
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(post)}
                              title="Edit post"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-serif">Edit Post</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                  id="edit-title"
                                  value={formData.title}
                                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                  placeholder="Enter post title"
                                  className={formErrors.title ? 'border-destructive' : ''}
                                />
                                {formErrors.title && (
                                  <p className="text-sm text-destructive">{formErrors.title}</p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-content">Content</Label>
                                <Textarea
                                  id="edit-content"
                                  value={formData.content}
                                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                  placeholder="Write your story..."
                                  rows={12}
                                  className={formErrors.content ? 'border-destructive' : ''}
                                />
                                {formErrors.content && (
                                  <p className="text-sm text-destructive">{formErrors.content}</p>
                                )}
                              </div>
                              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                <div className="space-y-0.5">
                                  <Label htmlFor="edit-locked" className="text-base">Lock Content</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Require authentication to view this post
                                  </p>
                                </div>
                                <Switch
                                  id="edit-locked"
                                  checked={formData.isLocked}
                                  onCheckedChange={(checked) => setFormData({ ...formData, isLocked: checked })}
                                />
                              </div>
                              <MediaUploader postId={post.id} />
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingPost(null);
                                  setFormData({ title: '', content: '', isLocked: false });
                                  setFormErrors({});
                                }}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleSubmit} disabled={updatePost.isPending}>
                                {updatePost.isPending ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Delete post">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Post</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{post.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(post.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                      {post.content.substring(0, 150)}
                      {post.content.length > 150 && '...'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif font-semibold">Access Control</h2>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <AllowlistManager />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
