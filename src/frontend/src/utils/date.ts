/**
 * Formats a post creation timestamp (epoch seconds) to a human-readable date
 * in the Australia/Sydney timezone using English locale.
 * 
 * @param createdAtSeconds - Unix timestamp in seconds (from post.createdAt)
 * @returns Formatted date string (e.g., "February 7, 2026")
 */
export function formatPostDateSydney(createdAtSeconds: bigint | number): string {
  const milliseconds = Number(createdAtSeconds) * 1000;
  
  return new Date(milliseconds).toLocaleDateString('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
