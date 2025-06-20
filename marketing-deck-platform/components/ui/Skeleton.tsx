import React from 'react';
import clsx from 'clsx';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export default function Skeleton({ width = '100%', height = 20, className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-lg bg-gradient-to-r from-[#0A0A0B] via-[#3B82F6]/20 to-[#8B5CF6]/20',
        className
      )}
      style={{ width, height }}
    >
      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
} 