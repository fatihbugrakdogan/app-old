export function formatDuration(dateString: string): string {
  const start = new Date(dateString);
  const now = new Date();
  const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const diffInSeconds = Math.floor((utcNow.getTime() - start.getTime()) / 1000);

  const hours = Math.floor(diffInSeconds / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ago`;
  }
  if (minutes > 0) {
    return `${minutes}m ago`;
  }
  return "Just now";
}
