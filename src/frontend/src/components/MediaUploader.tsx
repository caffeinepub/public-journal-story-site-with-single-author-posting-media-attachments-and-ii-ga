import { useState, useRef } from 'react';
import { useAddMediaToPost } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, Image as ImageIcon, Video } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob, MediaType } from '../backend';
import type { PostId } from '../backend';

interface MediaUploaderProps {
  postId: PostId;
}

export default function MediaUploader({ postId }: MediaUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMedia = useAddMediaToPost();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error('Please select an image or video file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      const mediaType = isImage ? MediaType.image : MediaType.video;

      await addMedia.mutateAsync({
        postId,
        file: blob,
        mediaType,
      });

      toast.success('Media uploaded successfully');
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Failed to upload media');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Media Attachments</Label>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Upload Media'}
          </Button>
        </div>
        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} />
            <p className="text-xs text-muted-foreground text-center">
              {uploadProgress}% uploaded
            </p>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          <ImageIcon className="inline h-3 w-3 mr-1" />
          Images and
          <Video className="inline h-3 w-3 mx-1" />
          videos supported
        </p>
      </div>
    </div>
  );
}
