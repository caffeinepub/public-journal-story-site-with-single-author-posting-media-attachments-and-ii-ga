import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useRemoveMediaFromPost } from '../hooks/useQueries';
import MediaUploader from './MediaUploader';
import type { Post } from '../backend';
import { MediaType } from '../backend';

interface AdminPostMediaManagerProps {
  post: Post;
}

export default function AdminPostMediaManager({ post }: AdminPostMediaManagerProps) {
  const removeMedia = useRemoveMediaFromPost();
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [expandedImages, setExpandedImages] = useState<Set<number>>(new Set());

  const handleRemoveMedia = async (mediaIndex: number) => {
    setDeletingIndex(mediaIndex);
    try {
      await removeMedia.mutateAsync({
        postId: post.id,
        mediaIndex: BigInt(mediaIndex),
      });
      toast.success('Media removed successfully');
    } catch (error: any) {
      const message = error.message || 'Failed to remove media';
      toast.error(message);
    } finally {
      setDeletingIndex(null);
    }
  };

  const toggleImageExpansion = (index: number) => {
    setExpandedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <MediaUploader postId={post.id} />

      {post.media && post.media.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Current Attachments ({post.media.length})</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            {post.media.map((item, index) => {
              const isExpanded = expandedImages.has(index);
              const isImage = item.mediaType === MediaType.image;

              return (
                <Card
                  key={index}
                  className={`overflow-hidden border-border/50 relative group transition-all ${
                    isExpanded ? 'sm:col-span-2' : ''
                  }`}
                >
                  <div className="relative">
                    {isImage ? (
                      <div className="relative">
                        <img
                          src={item.file.getDirectURL()}
                          alt={`Attachment ${index + 1}`}
                          className={`w-full object-cover cursor-pointer transition-all ${
                            isExpanded ? 'h-auto max-h-none' : 'h-48'
                          }`}
                          loading="lazy"
                          onClick={() => toggleImageExpansion(index)}
                          title={isExpanded ? 'Click to collapse' : 'Click to expand'}
                        />
                        <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1.5 text-xs font-medium pointer-events-none">
                          <ImageIcon className="h-3 w-3" />
                          Image
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <video
                          src={item.file.getDirectURL()}
                          className="w-full h-48 object-cover"
                          preload="metadata"
                        />
                        <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1.5 text-xs font-medium pointer-events-none">
                          <VideoIcon className="h-3 w-3" />
                          Video
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    className="p-3 flex items-center justify-between bg-card"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-sm text-muted-foreground">
                      Attachment {index + 1}
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deletingIndex === index}
                          className="shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          {deletingIndex === index ? 'Removing...' : 'Remove'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Media Attachment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove this {item.mediaType === MediaType.image ? 'image' : 'video'} from the post. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveMedia(index)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
