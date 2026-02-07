import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllPosts, useCreatePost, useUpdatePost, useDeletePost } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Lock, Unlock, Eye } from 'lucide-react';
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

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      await createPost.mutateAsync(formData);
      toast.success('Post created successfully');
      setIsCreateDialogOpen(false);
      setFormData({ title: '', content: '', isLocked: false });
      setFormErrors({});
    } catch (error) {
      toast.error('Failed to create post');
      console.error(error);
    }
  };

  const handleUpdate = async () => {
    if (!editingPost || !validateForm()) return;

    try {
      await updatePost.mutateAsync({
        postId: editingPost.id,
        ...formData,
      });
      toast.success('Post updated successfully');
      setEditingPost(null);
      setFormData({ title: '', content: '', isLocked: false });
      setFormErrors({});
    } catch (error) {
      toast.error('Failed to update post');
      console.error(error);
    }
  };

  const handleDelete = async (postId: bigint) => {
    try {
      await deletePost.mutateAsync(postId);
      toast.success('Post deleted successfully');
    } catch (error) {
      toast.error('Failed to delete post');
      console.error(error);
    }
  };

  const openEditDialog = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      isLocked: post.isLocked,
    });
    setFormErrors({});
  };

  const closeEditDialog = () => {
    setEditingPost(null);
    setFormData({ title: '', content: '', isLocked: false });
    setFormErrors({});
  };

  const openCreateDialog = () => {
    setFormData({ title: '', content: '', isLocked: false });
    setFormErrors({});
    setIsCreateDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-12">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl py-12">
        <AsyncState error={error as Error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-serif font-bold">Admin Dashboard</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} size="lg">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="locked" className="flex items-center gap-2">
                  {formData.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  Locked Content
                </Label>
                <Switch
                  id="locked"
                  checked={formData.isLocked}
                  onCheckedChange={(checked) => setFormData({ ...formData, isLocked: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createPost.isPending}>
                {createPost.isPending ? 'Creating...' : 'Create Post'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Your Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {!posts || posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No posts yet. Create your first story!</p>
                  <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Post
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedPosts.map((post) => (
                    <Card key={post.id.toString()} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-serif font-semibold text-lg truncate">
                                {post.title || 'Untitled Entry'}
                              </h3>
                              {post.isLocked && (
                                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatPostDateSydney(post.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate({ to: '/post/$postId', params: { postId: post.id.toString() } })}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(post)}
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
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="edit-locked" className="flex items-center gap-2">
                                      {formData.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                      Locked Content
                                    </Label>
                                    <Switch
                                      id="edit-locked"
                                      checked={formData.isLocked}
                                      onCheckedChange={(checked) => setFormData({ ...formData, isLocked: checked })}
                                    />
                                  </div>
                                  {editingPost && (
                                    <MediaUploader postId={editingPost.id} />
                                  )}
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={closeEditDialog}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleUpdate} disabled={updatePost.isPending}>
                                    {updatePost.isPending ? 'Saving...' : 'Save Changes'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <AllowlistManager />
        </div>
      </div>
    </div>
  );
}
