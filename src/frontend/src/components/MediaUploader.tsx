import { useState, useRef } from 'react';
import { useAddMediaToPost } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, Image as ImageIcon, Video, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob, MediaType } from '../backend';
import type { PostId } from '../backend';

interface MediaUploaderProps {
  postId: PostId;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export default function MediaUploader({ postId }: MediaUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMedia = useAddMediaToPost();

  const resetToIdle = () => {
    setUploadState('idle');
    setUploadProgress(0);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear previous success/error state when starting a new upload
    if (uploadState === 'success' || uploadState === 'error') {
      resetToIdle();
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setErrorMessage('Please select an image or video file');
      setUploadState('error');
      toast.error('Please select an image or video file');
      return;
    }

    setUploadState('uploading');
    setUploadProgress(0);
    setErrorMessage('');

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

      setUploadState('success');
      toast.success('Media uploaded successfully');
      
      // Success state remains visible until user starts another upload
    } catch (error: any) {
      setUploadState('error');
      const message = error.message || 'Failed to upload media';
      setErrorMessage(message);
      toast.error(message);
      
      // Error state remains visible until user starts another upload
    }
  };

  const isDisabled = uploadState === 'uploading';

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
            disabled={isDisabled}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisabled}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploadState === 'uploading' ? 'Uploading...' : 'Upload Media'}
          </Button>
        </div>

        {uploadState === 'uploading' && (
          <div className="space-y-2 p-4 rounded-lg border bg-muted/30">
            <Progress value={uploadProgress} />
            <p className="text-sm text-muted-foreground text-center font-medium">
              {uploadProgress}% uploaded
            </p>
          </div>
        )}

        {uploadState === 'success' && (
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Upload complete! Media added successfully.
            </p>
          </div>
        )}

        {uploadState === 'error' && errorMessage && (
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {errorMessage}
            </p>
          </div>
        )}

        {uploadState === 'idle' && (
          <p className="text-xs text-muted-foreground">
            <ImageIcon className="inline h-3 w-3 mr-1" />
            Images and
            <Video className="inline h-3 w-3 mx-1" />
            videos supported
          </p>
        )}
      </div>
    </div>
  );
}
