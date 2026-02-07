import { Card } from '@/components/ui/card';
import type { MediaAttachment } from '../backend';
import { MediaType } from '../backend';

interface MediaGalleryProps {
  media: MediaAttachment[];
}

export default function MediaGallery({ media }: MediaGalleryProps) {
  if (!media || media.length === 0) return null;

  return (
    <div className="space-y-6 pt-4">
      <h3 className="text-xl font-serif font-semibold">Attachments</h3>
      <div className="grid gap-6 sm:grid-cols-2">
        {media.map((item, index) => (
          <Card key={index} className="overflow-hidden border-border/50">
            {item.mediaType === MediaType.image ? (
              <img
                src={item.file.getDirectURL()}
                alt={`Attachment ${index + 1}`}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            ) : (
              <video
                src={item.file.getDirectURL()}
                controls
                className="w-full h-auto"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
