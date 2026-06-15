import { useQuery } from "@tanstack/react-query";
import { getPins } from "@/services/pinsService";

export default function MyPinsPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["pins"],
    queryFn: getPins,
  });

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-auto px-6 py-10">
      <h1 className="text-lg font-medium text-[var(--slate-surface-text)] mb-8">My Pins</h1>

      {isLoading && <div className="text-[var(--slate-muted)]">Loading...</div>}

      {error && (
        <div className="text-red-500">
          {error instanceof Error ? error.message : "An error occurred"}
        </div>
      )}

      {!isLoading && !error && data?.pins.length === 0 && (
        <div className="py-20 text-center text-[var(--slate-muted)]">No pins yet.</div>
      )}

      <div className="columns-3 gap-5 space-y-5">
        {data?.pins.map((pin, index) => (
          <article
            key={pin.id}
            className="break-inside-avoid rounded-2xl bg-[#FAFAF8] border border-[#E8E6E1] p-5 shadow-sm hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-200"
          >
            <div
              className="mb-4 rounded-xl bg-[#E8E6E1]/70"
              style={{ height: `${120 + (index % 4) * 36}px` }}
            />

            <h3 className="font-medium text-[#2D2D2D] mb-2 font-[family-name:var(--font-ui)]">
              {pin.title}
            </h3>

            <p className="text-sm text-[#4A4A4A] leading-6 font-[family-name:var(--font-serif)]">
              {pin.summary}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
