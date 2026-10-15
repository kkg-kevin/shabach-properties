import { Camera } from 'lucide-react';

// Shown instead of a stock photo, so a listing never appears to picture land it does not
export function PhotoPlaceholder({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 bg-tint text-brand-purple ${className}`}
      role="img"
      aria-label="Photos coming soon"
    >
      <Camera className="h-8 w-8 opacity-60" />
      <span className="text-sm font-semibold">Photos coming soon</span>
    </div>
  );
}
