import { useQuery } from "@tanstack/react-query";
import FolderPanel from "@/components/home/FolderPanel";
import { getPins } from "@/services/pinsService";

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
    <FolderPanel
      title="My Pins"
      onClose={() => setShowMyPins(false)}
      className="top-16 w-[950px] max-h-[720px]"
      bodyClassName="max-h-[660px] overflow-y-auto p-8"
    >
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
    </FolderPanel>
  );
}
