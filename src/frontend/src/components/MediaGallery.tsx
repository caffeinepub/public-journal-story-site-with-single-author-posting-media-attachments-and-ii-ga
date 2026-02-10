import { useState } from 'react';
import { Card } from '@/components/ui/card';
import type { MediaAttachment } from '../backend';
import { MediaType } from '../backend';

interface MediaGalleryProps {
  media: MediaAttachment[];
}

export default function MediaGallery({ media }: MediaGalleryProps) {
  const [expandedImages, setExpandedImages] = useState<Set<number>>(new Set());

  if (!media || media.length === 0) return null;

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
    <div className="space-y-6 pt-4">
      <h3 className="text-xl font-serif font-semibold">Attachments</h3>
      <div className="grid gap-6 sm:grid-cols-2">
        {media.map((item, index) => {
          const isExpanded = expandedImages.has(index);
          const isImage = item.mediaType === MediaType.image;

          return (
            <Card
              key={index}
              className={`overflow-hidden border-border/50 transition-all ${
                isExpanded ? 'sm:col-span-2' : ''
              }`}
            >
              {isImage ? (
                <img
                  src={item.file.getDirectURL()}
                  alt={`Attachment ${index + 1}`}
                  className={`w-full h-auto object-cover cursor-pointer transition-all ${
                    isExpanded ? 'max-h-none' : 'max-h-96'
                  }`}
                  loading="lazy"
                  onClick={() => toggleImageExpansion(index)}
                  title={isExpanded ? 'Click to collapse' : 'Click to expand'}
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
          );
        })}
      </div>
    </div>
  );
}
