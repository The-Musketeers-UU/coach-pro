import type { DragEvent } from "react";

import type { DropPreviewLocation } from "@/components/dashboard/types";

type DropPreviewBarProps = DropPreviewLocation & {
  isActive: boolean;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnter: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
};

export function DropPreviewBar({ isActive, onDrop, onDragEnter, onDragOver }: DropPreviewBarProps) {
  return (
    <div
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      className={`h-1 rounded-full transition ${
        isActive ? "bg-primary" : "bg-transparent"
      }`}
    />
  );
}
