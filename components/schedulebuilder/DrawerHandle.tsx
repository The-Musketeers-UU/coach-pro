import type { ComponentPropsWithoutRef } from "react";

type DrawerHandleProps = {
  isOpen: boolean;
  onOpen: () => void;
  label?: string;
} & ComponentPropsWithoutRef<"button">;

export function DrawerHandle({
  isOpen,
  onOpen,
  label = "Sparade moduler",
  className = "",
  ...buttonProps
}: DrawerHandleProps) {
  if (isOpen) {
    return null;
  }

  return (
    <button
      type="button"
      className={`pointer-events-auto fixed left-0 top-1/2 z-30 hidden -translate-y-1/2 transform items-center gap-2 rounded-r-lg bg-primary/90 px-1.5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-content shadow-lg transition hover:bg-primary lg:flex ${className}`}
      onMouseEnter={onOpen}
      onFocus={onOpen}
      onClick={onOpen}
      aria-label={`Visa ${label.toLowerCase()}`}
      {...buttonProps}
    >
      <span className="rotate-90 whitespace-nowrap">{label}</span>
    </button>
  );
}
