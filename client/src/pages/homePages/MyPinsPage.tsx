import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPins } from "../../services/pinsService";

export default function MyPinsPage({
  setShowMyPins,
}: {
  setShowMyPins: (show: boolean) => void;
}) {
  const { data, error, isLoading } = useQuery({
    queryKey: ["pins"],
    queryFn: getPins,
  });

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[950px] max-h-[720px] bg-white/90 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-[#E8E6E1] overflow-hidden backdrop-blur-md popup-animate-in font-[family-name:var(--font-ui)]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E6E1]">
        <h2 className="text-sm font-medium text-[#2D2D2D]">My Pins</h2>
        <button
          onClick={() => setShowMyPins(false)}
          className="p-1.5 rounded-xl text-[#8A8A8A] hover:text-[#2D2D2D] hover:bg-[#F0EEEA] transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className="max-h-[660px] overflow-y-auto p-8">
        {isLoading && (
          <div className="text-[#4A4A4A]">Loading...</div>
        )}

        {error && (
          <div className="text-red-500">
            {error instanceof Error ? error.message : "An error occurred"}
          </div>
        )}

        {!isLoading && !error && data?.pins.length === 0 && (
          <div className="py-20 text-center text-[#8A8A8A]">
            No pins yet.
          </div>
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
    </div>
  );
}
