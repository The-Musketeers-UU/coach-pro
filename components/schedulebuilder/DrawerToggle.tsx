type DrawerToggleProps = {
  targetId: string;
  onOpen: () => void;
};

export function DrawerToggle({ targetId, onOpen }: DrawerToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        aria-controls={targetId}
        className="btn btn-primary btn-sm lg:hidden"
        onClick={onOpen}
      >
        Visa reusable blocks
      </button>
    </div>
  );
}
