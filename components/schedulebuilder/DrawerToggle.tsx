export function DrawerToggle({ targetId }: { targetId: string }) {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={targetId} className="btn btn-primary btn-sm lg:hidden">
        Visa reusable blocks
      </label>
    </div>
  );
}
