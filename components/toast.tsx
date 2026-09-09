export function Toast({ show, message }: { show: boolean; message: string }) {
  return (
    <div
      aria-live="polite"
      className={
        "pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center transition-opacity duration-200 " +
        (show ? "opacity-100" : "opacity-0")
      }
    >
      <span className="rounded-full bg-surface px-5 py-3 text-sm font-medium text-text">
        {message}
      </span>
    </div>
  );
}
